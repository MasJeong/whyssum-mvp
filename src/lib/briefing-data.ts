import type { RoleKey } from "@/lib/mvp-data";

export type BriefingImpact = "low" | "medium" | "high";
export type BriefingRole = RoleKey | "all";

export type BriefingItem = {
  id: string;
  title: string;
  summary: string;
  role: BriefingRole;
  tags: string[];
  impact: BriefingImpact;
  publishedAt: string;
  sourceName: string;
  sourceUrl: string;
  relatedTool: string;
};

export type BriefingSortBy = "publishedAt" | "priority";

export const briefingItems: BriefingItem[] = [
  {
    id: "bf-001",
    title: "Node.js LTS 운영 전환 사례 증가",
    summary: "최근 배포 안정성을 이유로 Node.js LTS 전환 사례가 늘고 있으며, 장기 유지보수 정책을 함께 검토하는 흐름이 강해졌습니다.",
    role: "backend",
    tags: ["nodejs", "lts", "운영"],
    impact: "high",
    publishedAt: "2026-02-20T08:30:00.000Z",
    sourceName: "Node.js Blog",
    sourceUrl: "https://nodejs.org/en/blog",
    relatedTool: "Node.js",
  },
  {
    id: "bf-002",
    title: "Storybook 9 준비 이슈 정리",
    summary: "디자인 시스템 팀에서 Storybook 업데이트를 준비하면서 애드온 호환성과 문서화 자동화가 핵심 이슈로 언급되고 있습니다.",
    role: "designer",
    tags: ["storybook", "design-system", "docs"],
    impact: "medium",
    publishedAt: "2026-02-18T04:10:00.000Z",
    sourceName: "Storybook Blog",
    sourceUrl: "https://storybook.js.org/blog/",
    relatedTool: "Storybook",
  },
  {
    id: "bf-003",
    title: "PM 도구에서 AI 요약 기능 확산",
    summary: "요구사항/회의록 자동 요약 기능이 PM 툴 전반에 확산되며, 업무 기록 표준화와 리뷰 품질이 주요 평가 항목으로 떠오르고 있습니다.",
    role: "pm",
    tags: ["pm", "ai", "workflow"],
    impact: "medium",
    publishedAt: "2026-02-22T11:45:00.000Z",
    sourceName: "Atlassian Blog",
    sourceUrl: "https://www.atlassian.com/blog",
    relatedTool: "Jira",
  },
  {
    id: "bf-004",
    title: "FastAPI 생태계에서 비동기 성능 튜닝 논의",
    summary: "FastAPI 프로젝트에서 Pydantic/ASGI 구성 최적화 사례가 증가하며, 도입 초기에 병목 점검을 병행하는 패턴이 늘었습니다.",
    role: "backend",
    tags: ["fastapi", "performance", "async"],
    impact: "high",
    publishedAt: "2026-02-15T07:20:00.000Z",
    sourceName: "FastAPI Release Notes",
    sourceUrl: "https://fastapi.tiangolo.com/release-notes/",
    relatedTool: "FastAPI",
  },
  {
    id: "bf-005",
    title: "Linear 운영팀의 분기 계획 템플릿 공개",
    summary: "분기 계획과 이슈 우선순위 정렬 템플릿이 공유되며 PM/개발 협업 프로세스의 단순화 사례가 주목받고 있습니다.",
    role: "pm",
    tags: ["linear", "planning", "collaboration"],
    impact: "low",
    publishedAt: "2026-02-12T09:05:00.000Z",
    sourceName: "Linear Blog",
    sourceUrl: "https://linear.app/blog",
    relatedTool: "Linear",
  },
  {
    id: "bf-006",
    title: "Figma Variables 적용 사례 확산",
    summary: "제품팀이 다국어/테마 대응을 위해 Variables를 적극 활용하면서 디자인 토큰 운영 자동화 사례가 빠르게 늘고 있습니다.",
    role: "designer",
    tags: ["figma", "variables", "design-token"],
    impact: "high",
    publishedAt: "2026-02-21T03:00:00.000Z",
    sourceName: "Figma Help Center",
    sourceUrl: "https://help.figma.com/hc/en-us",
    relatedTool: "Figma",
  },
  {
    id: "bf-007",
    title: "Developer survey 데이터 공개 주기 리마인드",
    summary: "Stack Overflow 설문은 대규모 샘플 기반 장기 트렌드 확인에 강점이 있어 분기 단위 해석 기준으로 재활용 가치가 큽니다.",
    role: "all",
    tags: ["survey", "trend", "benchmark"],
    impact: "medium",
    publishedAt: "2026-02-10T06:50:00.000Z",
    sourceName: "Stack Overflow Insights",
    sourceUrl: "https://insights.stackoverflow.com/survey/",
    relatedTool: "Benchmark",
  },
  {
    id: "bf-008",
    title: "G2 리서치에서 방법론 투명성 강조",
    summary: "비교 플랫폼에서 신뢰도 확보를 위해 스코어링 방법론과 검증 절차를 공개하는 흐름이 강화되고 있습니다.",
    role: "all",
    tags: ["compare", "trust", "methodology"],
    impact: "medium",
    publishedAt: "2026-02-11T10:40:00.000Z",
    sourceName: "G2 Research Guidelines",
    sourceUrl: "https://research.g2.com/research-guidelines",
    relatedTool: "Methodology",
  },
];

/** filterBriefings 필터 조건 (직무·영향도·기간) */
type FilterParams = {
  role?: string | null;
  impact?: string | null;
  periodDays?: number;
  sortBy?: BriefingSortBy;
};

/**
 * 영향도 코드를 정렬 우선순위 숫자로 변환한다.
 * @param impact 영향도 코드
 * @returns high > medium > low 정렬용 숫자
 */
function getImpactRank(impact: BriefingImpact) {
  if (impact === "high") return 3;
  if (impact === "medium") return 2;
  return 1;
}

/**
 * 브리핑 정렬 기준을 안전한 허용값으로 정규화한다.
 * @param value 원본 정렬 문자열
 * @returns 허용 정렬 기준 또는 기본값(priority)
 */
export function parseBriefingSortBy(value?: string | null): BriefingSortBy {
  return value === "publishedAt" ? "publishedAt" : "priority";
}

/**
 * 브리핑 목록을 정렬 기준에 맞게 정렬한다.
 * @param items 정렬할 브리핑 목록
 * @param sortBy 정렬 기준
 * @returns 정렬된 브리핑 목록
 */
export function sortBriefings(items: BriefingItem[], sortBy: BriefingSortBy) {
  return [...items].sort((left, right) => {
    if (sortBy === "publishedAt") {
      return new Date(right.publishedAt).getTime() - new Date(left.publishedAt).getTime();
    }

    const impactCompared = getImpactRank(right.impact) - getImpactRank(left.impact);
    if (impactCompared !== 0) {
      return impactCompared;
    }
    return new Date(right.publishedAt).getTime() - new Date(left.publishedAt).getTime();
  });
}

/**
 * 직무/영향도/기간 조건으로 브리핑 목록을 필터링하고 정렬한다.
 * @param params 필터 조건
 * @returns 조건에 맞는 브리핑 목록
 */
export function filterBriefings(params: FilterParams) {
  const now = Date.now();
  const maxAgeMs = params.periodDays ? params.periodDays * 24 * 60 * 60 * 1000 : null;

  const filtered = briefingItems
    .filter((item) => {
      if (params.role && params.role !== "all") {
        if (!(item.role === params.role || item.role === "all")) {
          return false;
        }
      }

      if (params.impact && params.impact !== "all" && item.impact !== params.impact) {
        return false;
      }

      if (maxAgeMs) {
        const age = now - new Date(item.publishedAt).getTime();
        if (age > maxAgeMs) {
          return false;
        }
      }

      return true;
    });

  return sortBriefings(filtered, params.sortBy ?? "priority");
}
