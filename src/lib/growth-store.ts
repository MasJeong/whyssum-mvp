import type { GrowthEvent } from "@/lib/growth-events";
import { buildGrowthKpiReport, getGrowthWindowDays, type GrowthWindow } from "@/lib/growth-kpis";

const GROWTH_EVENT_RETENTION_MS = 30 * 24 * 60 * 60 * 1000;
const GROWTH_EVENT_LIMIT = 5000;
const growthEvents: GrowthEvent[] = [];

/**
 * 메모리 저장소에서 만료된 성장 이벤트를 정리한다.
 * @returns 없음
 */
function pruneGrowthEvents() {
  const threshold = Date.now() - GROWTH_EVENT_RETENTION_MS;
  while (growthEvents.length > 0) {
    const first = growthEvents[0];
    if (!first || new Date(first.occurredAt).getTime() >= threshold) break;
    growthEvents.shift();
  }
  if (growthEvents.length > GROWTH_EVENT_LIMIT) {
    growthEvents.splice(0, growthEvents.length - GROWTH_EVENT_LIMIT);
  }
}

/**
 * 성장 이벤트를 메모리 저장소에 추가한다.
 * @param event 저장할 이벤트
 * @returns 없음
 */
export function appendGrowthEvent(event: GrowthEvent) {
  growthEvents.push(event);
  pruneGrowthEvents();
}

/**
 * 최근 윈도우 기준 이벤트 목록을 반환한다.
 * @param window KPI 윈도우
 * @returns 필터링된 이벤트 목록
 */
export function readGrowthEventsByWindow(window: GrowthWindow) {
  pruneGrowthEvents();
  const threshold = Date.now() - getGrowthWindowDays(window) * 24 * 60 * 60 * 1000;
  return growthEvents.filter((item) => new Date(item.occurredAt).getTime() >= threshold);
}

/**
 * 최근 윈도우 기준 KPI 리포트를 생성한다.
 * @param window KPI 윈도우
 * @returns KPI 리포트
 */
export function getGrowthKpiReport(window: GrowthWindow) {
  return buildGrowthKpiReport(readGrowthEventsByWindow(window), window);
}
