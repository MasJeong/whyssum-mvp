import { trendData, type RoleKey, type TrendMetric } from "@/lib/mvp-data";

type CatalogItem = {
  tool: string;
  repo: string;
  difficulty: TrendMetric["difficulty"];
};

type RepoSnapshot = {
  stars: number;
  commits30d: number;
  contributors30d: number;
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
    { tool: "NestJS", repo: "nestjs/nest", difficulty: "낮음" },
    { tool: "Django", repo: "django/django", difficulty: "중간" },
    { tool: "Rust (Axum)", repo: "tokio-rs/axum", difficulty: "높음" },
    { tool: "Kotlin (Ktor)", repo: "ktorio/ktor", difficulty: "중간" },
  ],
  designer: [
    { tool: "Figma", repo: "figma/plugin-samples", difficulty: "낮음" },
    { tool: "Framer", repo: "framer/motion", difficulty: "중간" },
    { tool: "Adobe XD", repo: "adobe/xd-plugin-samples", difficulty: "중간" },
    { tool: "Rive", repo: "rive-app/rive-react", difficulty: "높음" },
    { tool: "Spline", repo: "splinetool/react-spline", difficulty: "중간" },
    { tool: "ProtoPie", repo: "protopie/protopie-player-web", difficulty: "중간" },
    { tool: "Lottie", repo: "airbnb/lottie-web", difficulty: "낮음" },
    { tool: "Storybook", repo: "storybookjs/storybook", difficulty: "중간" },
  ],
  pm: [
    { tool: "Notion", repo: "makenotion/notion-sdk-js", difficulty: "낮음" },
    { tool: "Jira", repo: "jira-node/node-jira-client", difficulty: "중간" },
    { tool: "Linear", repo: "linear/linear", difficulty: "낮음" },
    { tool: "Amplitude", repo: "amplitude/Amplitude-TypeScript", difficulty: "높음" },
    { tool: "Mixpanel", repo: "mixpanel/mixpanel-js", difficulty: "중간" },
    { tool: "Asana", repo: "Asana/node-asana", difficulty: "낮음" },
    { tool: "ClickUp", repo: "clickup/clickup-api-v2", difficulty: "낮음" },
    { tool: "Miro", repo: "miroapp/api-clients", difficulty: "낮음" },
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

  return values.map((value) => Math.max(1, Math.round((value / total) * 100)));
}

function clamp(min: number, max: number, value: number) {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function fallbackSnapshot(role: RoleKey, tool: string): RepoSnapshot {
  const fallback = trendData[role].find((item) => item.tool === tool);
  if (!fallback) {
    return { stars: 1200, commits30d: 8, contributors30d: 3 };
  }

  return {
    stars: fallback.demandIndex * 300,
    commits30d: Math.max(4, fallback.growthRate * 3),
    contributors30d: Math.max(2, Math.round(fallback.adoptionRate / 8)),
  };
}

async function fetchRepoSnapshot(role: RoleKey, item: CatalogItem): Promise<RepoSnapshot> {
  const now = Date.now();
  const cached = snapshotCache.get(item.repo);

  if (cached && cached.expiresAt > now) {
    return cached.value;
  }

  try {
    const since = new Date(now - 30 * ONE_DAY_MS).toISOString();
    const repoMeta = await fetchJson(`https://api.github.com/repos/${item.repo}`);
    const commits = await fetchJson(`https://api.github.com/repos/${item.repo}/commits?since=${encodeURIComponent(since)}&per_page=100`);

    const contributors = Array.isArray(commits)
      ? new Set(
          commits
            .map((entry) => entry?.author?.login)
            .filter((value): value is string => typeof value === "string" && value.length > 0),
        ).size
      : 0;

    const snapshot: RepoSnapshot = {
      stars: Number(repoMeta.stargazers_count ?? 0),
      commits30d: Array.isArray(commits) ? commits.length : 0,
      contributors30d: contributors,
    };

    snapshotCache.set(item.repo, { value: snapshot, expiresAt: now + CACHE_TTL_MS });
    return snapshot;
  } catch {
    const fallback = fallbackSnapshot(role, item.tool);
    snapshotCache.set(item.repo, { value: fallback, expiresAt: now + Math.floor(CACHE_TTL_MS / 3) });
    return fallback;
  }
}

function toTrendMetrics(catalog: CatalogItem[], snapshots: RepoSnapshot[]): TrendMetric[] {
  const popularityScores = snapshots.map((snapshot) => {
    const starWeight = Math.log10(snapshot.stars + 10) * 110;
    const activityWeight = snapshot.commits30d * 1.7;
    const contributorWeight = snapshot.contributors30d * 4.2;
    return starWeight + activityWeight + contributorWeight;
  });

  const adoptionRates = normalizeToPercent(popularityScores);

  return catalog.map((item, index) => {
    const snapshot = snapshots[index];
    const growthRate = clamp(1, 28, snapshot.commits30d / 2.2);
    const communityScore = clamp(20, 98, Math.log10(snapshot.stars + 1) * 19);
    const activityScore = clamp(10, 98, snapshot.commits30d * 1.45 + snapshot.contributors30d * 3.8);
    const stabilityScore = clamp(15, 96, communityScore * 0.58 + activityScore * 0.42);
    const demandIndex = clamp(25, 98, adoptionRates[index] * 0.42 + growthRate * 1.6 + communityScore * 0.4);

    return {
      tool: item.tool,
      adoptionRate: adoptionRates[index],
      growthRate,
      demandIndex,
      difficulty: item.difficulty,
      communityScore,
      activityScore,
      stabilityScore,
    };
  });
}

export async function getRoleTrendMetrics(role: RoleKey): Promise<RoleTrendResult> {
  const catalog = roleCatalog[role];

  try {
    const snapshots = await Promise.all(catalog.map((item) => fetchRepoSnapshot(role, item)));
    const metrics = toTrendMetrics(catalog, snapshots);
    return {
      metrics,
      mode: "live",
      source: "GitHub Metadata (stars) + 30d Commits + Contributors",
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
