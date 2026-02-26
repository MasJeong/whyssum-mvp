import { trendData, type RoleKey, type TrendMetric } from "@/lib/mvp-data";

type CatalogItem = {
  tool: string;
  repo: string;
  difficulty: TrendMetric["difficulty"];
};

type RepoSnapshot = {
  stars: number;
  commits30d: number;
};

type RoleTrendResult = {
  metrics: TrendMetric[];
  mode: "live" | "fallback";
  source: string;
  fetchedAt: string;
};

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const CACHE_TTL_MS = 12 * 60 * 60 * 1000;

const roleCatalog: Record<RoleKey, CatalogItem[]> = {
  backend: [
    { tool: "Node.js", repo: "nodejs/node", difficulty: "낮음" },
    { tool: "Spring Boot", repo: "spring-projects/spring-boot", difficulty: "중간" },
    { tool: "Go", repo: "golang/go", difficulty: "중간" },
    { tool: "FastAPI", repo: "fastapi/fastapi", difficulty: "낮음" },
  ],
  designer: [
    { tool: "Figma", repo: "figma/plugin-samples", difficulty: "낮음" },
    { tool: "Framer", repo: "framer/motion", difficulty: "중간" },
    { tool: "Adobe XD", repo: "adobe/xd-plugin-samples", difficulty: "중간" },
    { tool: "Rive", repo: "rive-app/rive-react", difficulty: "높음" },
  ],
  pm: [
    { tool: "Notion", repo: "makenotion/notion-sdk-js", difficulty: "낮음" },
    { tool: "Jira", repo: "jira-node/node-jira-client", difficulty: "중간" },
    { tool: "Linear", repo: "linear/linear", difficulty: "낮음" },
    { tool: "Amplitude", repo: "amplitude/Amplitude-TypeScript", difficulty: "높음" },
  ],
};

const snapshotCache = new Map<string, { value: RepoSnapshot; expiresAt: number }>();

async function fetchJson(url: string) {
  const response = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "whyssum-mvp",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`GitHub API request failed: ${response.status}`);
  }

  return response.json();
}

function normalizeToPercent(values: number[]) {
  const total = values.reduce((sum, value) => sum + value, 0);
  if (total <= 0) {
    return values.map(() => 0);
  }

  return values.map((value) => Math.round((value / total) * 100));
}

async function fetchRepoSnapshot(repo: string): Promise<RepoSnapshot> {
  const now = Date.now();
  const cached = snapshotCache.get(repo);

  if (cached && cached.expiresAt > now) {
    return cached.value;
  }

  const since = new Date(now - 30 * ONE_DAY_MS).toISOString();
  const repoMeta = await fetchJson(`https://api.github.com/repos/${repo}`);
  const commits = await fetchJson(`https://api.github.com/repos/${repo}/commits?since=${encodeURIComponent(since)}&per_page=100`);

  const snapshot: RepoSnapshot = {
    stars: Number(repoMeta.stargazers_count ?? 0),
    commits30d: Array.isArray(commits) ? commits.length : 0,
  };

  snapshotCache.set(repo, { value: snapshot, expiresAt: now + CACHE_TTL_MS });
  return snapshot;
}

function toTrendMetrics(catalog: CatalogItem[], snapshots: RepoSnapshot[]): TrendMetric[] {
  const popularityScores = snapshots.map((snapshot) => {
    const starWeight = Math.log10(snapshot.stars + 10) * 100;
    const activityWeight = snapshot.commits30d * 1.8;
    return starWeight + activityWeight;
  });

  const adoptionRates = normalizeToPercent(popularityScores);

  return catalog.map((item, index) => {
    const snapshot = snapshots[index];
    const growthRate = Math.max(0, Math.min(20, Math.round(snapshot.commits30d / 3)));
    const demandIndex = Math.max(
      35,
      Math.min(95, Math.round(adoptionRates[index] * 0.55 + growthRate * 2.2 + Math.log10(snapshot.stars + 1) * 6)),
    );

    return {
      tool: item.tool,
      adoptionRate: adoptionRates[index],
      growthRate,
      demandIndex,
      difficulty: item.difficulty,
    };
  });
}

export async function getRoleTrendMetrics(role: RoleKey): Promise<RoleTrendResult> {
  const catalog = roleCatalog[role];

  try {
    const snapshots = await Promise.all(catalog.map((item) => fetchRepoSnapshot(item.repo)));
    const metrics = toTrendMetrics(catalog, snapshots);
    return {
      metrics,
      mode: "live",
      source: "GitHub Repository Metadata + 30d Commit Activity",
      fetchedAt: new Date().toISOString(),
    };
  } catch {
    return {
      metrics: trendData[role],
      mode: "fallback",
      source: "Fallback Sample Dataset",
      fetchedAt: new Date().toISOString(),
    };
  }
}
