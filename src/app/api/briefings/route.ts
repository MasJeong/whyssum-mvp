import { NextResponse } from "next/server";
import { filterBriefings } from "@/lib/briefing-data";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit";

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_PER_WINDOW = 40;

/**
 * 필터된 브리핑 목록에서 요약 지표를 계산한다.
 * @param items 필터 결과 브리핑 목록
 * @returns 브리핑 상단 요약 지표
 */
function buildBriefingSummary(items: ReturnType<typeof filterBriefings>) {
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const highImpactCount = items.filter((item) => item.impact === "high").length;
  const recentCount7d = items.filter((item) => new Date(item.publishedAt).getTime() >= sevenDaysAgo).length;
  const roleCount = items.reduce<Record<string, number>>((acc, item) => {
    const key = item.role === "all" ? "all" : item.role;
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
  const recommendedRole = Object.entries(roleCount).sort((left, right) => right[1] - left[1])[0]?.[0] ?? "all";

  return {
    highImpactCount,
    recentCount7d,
    recommendedRole,
  };
}

/**
 * 브리핑 응답에 요청 제한 헤더를 통일해서 내려준다.
 * 프론트에서 재시도/쿨다운 동작을 만들 수 있도록 재설정 시각을 함께 포함한다.
 */
function setRateLimitHeaders(response: NextResponse, remaining: number, resetAt: number) {
  response.headers.set("X-RateLimit-Limit", String(RATE_LIMIT_PER_WINDOW));
  response.headers.set("X-RateLimit-Remaining", String(Math.max(0, remaining)));
  response.headers.set("X-RateLimit-Reset", String(Math.floor(resetAt / 1000)));
  return response;
}

/**
 * 브리핑 목록 API 진입점으로 필터 파라미터를 적용해 결과를 반환한다.
 * @param request HTTP 요청 객체
 * @returns 브리핑 목록 또는 제한 응답
 */
export async function GET(request: Request) {
  const ip = getClientIp(request.headers.get("x-forwarded-for")?.split(",")[0] ?? null);
  const rate = checkRateLimit(`briefings:${ip}`, {
    limit: RATE_LIMIT_PER_WINDOW,
    windowMs: RATE_LIMIT_WINDOW_MS,
  });

  if (!rate.allowed) {
    const tooManyResponse = NextResponse.json(
      { error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." },
      { status: 429 },
    );
    return setRateLimitHeaders(tooManyResponse, rate.remaining, rate.resetAt);
  }

  const url = new URL(request.url);
  const role = url.searchParams.get("role");
  const impact = url.searchParams.get("impact");
  const periodRaw = Number(url.searchParams.get("periodDays") ?? "30");
  // 조회 기간은 과도한 조회/비정상 값을 막기 위해 1~180일로 제한한다.
  const periodDays = Number.isFinite(periodRaw) ? Math.max(1, Math.min(180, periodRaw)) : 30;

  const items = filterBriefings({ role, impact, periodDays });
  const summary = buildBriefingSummary(items);

  const response = NextResponse.json({
    filters: { role: role ?? "all", impact: impact ?? "all", periodDays },
    count: items.length,
    fetchedAt: new Date().toISOString(),
    summary,
    items,
  });

  return setRateLimitHeaders(response, rate.remaining, rate.resetAt);
}
