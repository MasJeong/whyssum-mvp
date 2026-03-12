import { z } from "zod";

export const GROWTH_EVENTS_STORAGE_KEY = "whyssum:growth-events";
export const GROWTH_VISITOR_ID_KEY = "whyssum:visitor-id";
export const GROWTH_SESSION_ID_KEY = "whyssum:session-id";
export const GROWTH_EVENT_LIMIT = 400;
export const GROWTH_EVENT_DISPATCH = "whyssum:growth-event";

export const growthEventNameSchema = z.enum([
  "page_view",
  "role_hub_click",
  "trend_click",
  "scenario_click",
  "briefing_view",
  "briefing_filter_change",
  "briefing_card_action_click",
  "briefing_empty_state_recover",
  "scenario_show_all_toggle",
  "scenario_recommendation_expand",
  "scenario_snapshot_save",
  "scenario_snapshot_apply",
  "recommendation_recalculate",
  "recommendation_snapshot_save",
  "recommendation_share_link",
  "recommendation_share_summary",
  "compare_select",
  "compare_share_link",
  "compare_share_summary",
  "watchlist_add",
  "watchlist_remove",
  "watchlist_cta_click",
  "trust_help_open",
  "newsletter_subscribe",
  "rss_click",
  "ad_impression",
  "ad_click",
  "related_content_click",
  "revisit_widget_view",
]);

export type GrowthEventName = z.infer<typeof growthEventNameSchema>;

export const growthEventSchema = z.object({
  name: growthEventNameSchema,
  page: z.string().trim().min(1).max(80),
  visitorId: z.string().trim().min(6).max(80),
  sessionId: z.string().trim().min(6).max(80),
  occurredAt: z.string().datetime(),
  meta: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()])).default({}),
});

export type GrowthEvent = z.infer<typeof growthEventSchema>;

type GrowthEventInput = {
  name: GrowthEventName;
  page: string;
  meta?: Record<string, string | number | boolean | null | undefined>;
};

/**
 * 임의 문자열을 간단한 해시 기반 식별자로 변환한다.
 * @param prefix 식별자 접두어
 * @returns 충돌 가능성을 낮춘 ID
 */
function createRuntimeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * 브라우저 단위 방문자 식별자를 읽거나 새로 생성한다.
 * @returns 방문자 ID
 */
export function getOrCreateGrowthVisitorId() {
  if (typeof window === "undefined") return createRuntimeId("visitor");
  const existing = window.localStorage.getItem(GROWTH_VISITOR_ID_KEY);
  if (existing) return existing;
  const created = createRuntimeId("visitor");
  window.localStorage.setItem(GROWTH_VISITOR_ID_KEY, created);
  return created;
}

/**
 * 현재 세션 식별자를 읽거나 새로 생성한다.
 * @returns 세션 ID
 */
export function getOrCreateGrowthSessionId() {
  if (typeof window === "undefined") return createRuntimeId("session");
  const existing = window.sessionStorage.getItem(GROWTH_SESSION_ID_KEY);
  if (existing) return existing;
  const created = createRuntimeId("session");
  window.sessionStorage.setItem(GROWTH_SESSION_ID_KEY, created);
  return created;
}

/**
 * 로컬에 저장된 성장 이벤트 목록을 안전하게 읽는다.
 * @returns 최근 성장 이벤트 목록
 */
export function readGrowthEvents() {
  if (typeof window === "undefined") return [] as GrowthEvent[];
  try {
    const raw = window.localStorage.getItem(GROWTH_EVENTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return z.array(growthEventSchema).parse(parsed);
  } catch {
    return [];
  }
}

/**
 * 성장 이벤트 목록을 상한 개수로 잘라 저장한다.
 * @param items 저장할 이벤트 목록
 * @returns 없음
 */
export function writeGrowthEvents(items: GrowthEvent[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(GROWTH_EVENTS_STORAGE_KEY, JSON.stringify(items.slice(-GROWTH_EVENT_LIMIT)));
}

/**
 * 로깅 입력값을 표준 성장 이벤트 형태로 정규화한다.
 * @param input 이벤트 입력
 * @returns 검증된 성장 이벤트
 */
export function createGrowthEvent(input: GrowthEventInput): GrowthEvent {
  const meta = Object.fromEntries(
    Object.entries(input.meta ?? {}).filter((entry): entry is [string, string | number | boolean | null] => entry[1] !== undefined),
  );

  return growthEventSchema.parse({
    name: input.name,
    page: input.page,
    visitorId: getOrCreateGrowthVisitorId(),
    sessionId: getOrCreateGrowthSessionId(),
    occurredAt: new Date().toISOString(),
    meta,
  });
}

/**
 * 이벤트를 로컬에 저장하고 비동기 서버 전송을 시도한다.
 * @param input 이벤트 입력
 * @returns 생성된 이벤트 또는 null
 */
export async function trackGrowthEvent(input: GrowthEventInput) {
  if (typeof window === "undefined") return null;

  try {
    const event = createGrowthEvent(input);
    const events = readGrowthEvents();
    writeGrowthEvents([...events, event]);
    window.dispatchEvent(new CustomEvent(GROWTH_EVENT_DISPATCH, { detail: event }));
    console.info(`[growth-event] ${event.name}`, event);

    const body = JSON.stringify(event);
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      navigator.sendBeacon("/api/growth-events", new Blob([body], { type: "application/json" }));
    } else {
      void fetch("/api/growth-events", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body,
        keepalive: true,
      });
    }

    return event;
  } catch {
    return null;
  }
}

/**
 * 로컬 이벤트를 최근 기간 기준으로 필터링한다.
 * @param days 최근 조회 일수
 * @returns 필터링된 이벤트 목록
 */
export function readRecentGrowthEvents(days: number) {
  const threshold = Date.now() - days * 24 * 60 * 60 * 1000;
  return readGrowthEvents().filter((item) => new Date(item.occurredAt).getTime() >= threshold);
}
