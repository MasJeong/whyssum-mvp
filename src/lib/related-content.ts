import type { RoleKey } from "@/lib/mvp-data";
import { briefingItems } from "@/lib/briefing-data";
import { roles } from "@/lib/mvp-data";

export type RelatedContentContext = {
  page: "home" | "roles" | "trends" | "scenarios" | "compare" | "briefings" | "insights";
  role?: RoleKey;
  tool?: string;
  tags?: string[];
};

export type RelatedContentLink = {
  href: string;
  title: string;
  description: string;
  reason: string;
};

/**
 * 기본 후보 링크 목록을 현재 컨텍스트에서 생성한다.
 * @param context 현재 페이지 컨텍스트
 * @returns 후보 링크 목록
 */
function buildCandidateLinks(context: RelatedContentContext): RelatedContentLink[] {
  const roleKey = context.role ?? "backend";
  const roleInfo = roles.find((item) => item.key === roleKey) ?? roles[0];
  const briefingMatch = briefingItems.find((item) => item.role === roleKey || item.role === "all");

  return [
    {
      href: `/trends/${roleKey}`,
      title: `${roleInfo.name} 트렌드 보기`,
      description: `${roleInfo.name} 기준 지표를 먼저 확인합니다.`,
      reason: "직무 기준 탐색",
    },
    {
      href: `/scenarios/${roleKey}`,
      title: `${roleInfo.name} 상황추천`,
      description: "팀 조건으로 추천안을 다시 계산합니다.",
      reason: "활성화 유도",
    },
    {
      href: "/compare",
      title: "비교 화면으로 이동",
      description: "후보를 2~4개로 압축해 최종 선택안을 정리합니다.",
      reason: "핵심 행동 연결",
    },
    {
      href: "/briefings",
      title: "최신 브리핑 읽기",
      description: briefingMatch ? briefingMatch.title : "최근 변화와 해석을 한 번에 봅니다.",
      reason: "재방문 루프",
    },
    {
      href: "/insights",
      title: "월간 인사이트 보기",
      description: "긴 리포트 전에 핵심 변화만 빠르게 읽습니다.",
      reason: "콘텐츠 심화",
    },
  ];
}

/**
 * 컨텍스트에 따라 관련 링크를 정렬한다.
 * @param context 현재 페이지 컨텍스트
 * @returns 상위 3개 관련 링크
 */
export function getRelatedContentLinks(context: RelatedContentContext) {
  const candidates = buildCandidateLinks(context);
  const scored = candidates.map((item) => {
    let score = 0;
    if (context.page === "home" && item.href.includes("/roles")) score += 2;
    if (context.page === "trends" && item.href.includes("/scenarios")) score += 5;
    if (context.page === "scenarios" && item.href === "/compare") score += 6;
    if (context.page === "compare" && item.href === "/briefings") score += 4;
    if (context.page === "briefings" && item.href === "/insights") score += 5;
    if (context.page === "insights" && (item.href.includes("/trends") || item.href === "/compare")) score += 4;
    if (context.role && item.href.includes(context.role)) score += 3;
    if (context.tool && item.description.includes(context.tool)) score += 2;
    return { item, score };
  });

  return scored
    .sort((left, right) => right.score - left.score || left.item.title.localeCompare(right.item.title, "ko"))
    .slice(0, 3)
    .map((entry) => entry.item);
}
