import type { GrowthEvent } from "@/lib/growth-events";

export type GrowthWindow = "d1" | "d7" | "d30";

export type GrowthKpiReport = {
  window: GrowthWindow;
  sessionCount: number;
  visitorCount: number;
  activationRate: number;
  shareRate: number;
  revisitRate: number;
  adClickThroughRate: number;
  newsletterSubscribeRate: number;
  topEvents: Array<{ name: string; count: number }>;
};

const WINDOW_DAY_MAP: Record<GrowthWindow, number> = {
  d1: 1,
  d7: 7,
  d30: 30,
};

/**
 * 윈도우 문자열을 실제 일수로 변환한다.
 * @param window KPI 윈도우
 * @returns 일수
 */
export function getGrowthWindowDays(window: GrowthWindow) {
  return WINDOW_DAY_MAP[window];
}

/**
 * 분모가 0인 경우에도 안전하게 비율을 계산한다.
 * @param numerator 분자
 * @param denominator 분모
 * @returns 소수점 한 자리 반올림 비율
 */
function toSafeRate(numerator: number, denominator: number) {
  if (denominator <= 0) return 0;
  return Math.round((numerator / denominator) * 1000) / 10;
}

/**
 * 최근 성장 이벤트에서 KPI 집계를 계산한다.
 * @param events 집계 대상 이벤트 목록
 * @param window 집계 윈도우
 * @returns KPI 리포트
 */
export function buildGrowthKpiReport(events: GrowthEvent[], window: GrowthWindow): GrowthKpiReport {
  const uniqueSessions = new Set(events.map((item) => item.sessionId));
  const uniqueVisitors = new Set(events.map((item) => item.visitorId));
  const eventCounts = events.reduce<Record<string, number>>((acc, item) => {
    acc[item.name] = (acc[item.name] ?? 0) + 1;
    return acc;
  }, {});

  const activationEvents =
    (eventCounts.role_hub_click ?? 0) +
    (eventCounts.scenario_click ?? 0) +
    (eventCounts.recommendation_recalculate ?? 0) +
    (eventCounts.compare_select ?? 0);
  const shareEvents =
    (eventCounts.recommendation_share_link ?? 0) +
    (eventCounts.recommendation_share_summary ?? 0) +
    (eventCounts.compare_share_link ?? 0) +
    (eventCounts.compare_share_summary ?? 0);

  return {
    window,
    sessionCount: uniqueSessions.size,
    visitorCount: uniqueVisitors.size,
    activationRate: toSafeRate(activationEvents, uniqueSessions.size),
    shareRate: toSafeRate(shareEvents, uniqueSessions.size),
    revisitRate: toSafeRate(eventCounts.revisit_widget_view ?? 0, uniqueVisitors.size),
    adClickThroughRate: toSafeRate(eventCounts.ad_click ?? 0, eventCounts.ad_impression ?? 0),
    newsletterSubscribeRate: toSafeRate(eventCounts.newsletter_subscribe ?? 0, uniqueSessions.size),
    topEvents: Object.entries(eventCounts)
      .sort((left, right) => right[1] - left[1])
      .slice(0, 8)
      .map(([name, count]) => ({ name, count })),
  };
}
