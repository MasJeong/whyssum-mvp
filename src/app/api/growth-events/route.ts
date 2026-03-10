import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit";
import { appendGrowthEvent } from "@/lib/growth-store";
import { parseGrowthEventBody } from "@/lib/security/validation";

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_PER_WINDOW = 240;

/**
 * 성장 이벤트 API 응답에 제한 헤더를 설정한다.
 * @param response 응답 객체
 * @param remaining 남은 요청 수
 * @param resetAt 제한 해제 시각
 * @returns 헤더가 포함된 응답
 */
function setRateLimitHeaders(response: NextResponse, remaining: number, resetAt: number) {
  response.headers.set("X-RateLimit-Limit", String(RATE_LIMIT_PER_WINDOW));
  response.headers.set("X-RateLimit-Remaining", String(Math.max(0, remaining)));
  response.headers.set("X-RateLimit-Reset", String(Math.floor(resetAt / 1000)));
  return response;
}

/**
 * 성장 이벤트를 수집한다.
 * @param request HTTP 요청 객체
 * @returns 처리 결과 응답
 */
export async function POST(request: Request) {
  const ip = getClientIp(request.headers.get("x-forwarded-for")?.split(",")[0] ?? null);
  const rate = checkRateLimit(`growth-events:${ip}`, {
    limit: RATE_LIMIT_PER_WINDOW,
    windowMs: RATE_LIMIT_WINDOW_MS,
  });

  if (!rate.allowed) {
    return setRateLimitHeaders(
      NextResponse.json({ error: "이벤트 수집 요청이 너무 많습니다." }, { status: 429 }),
      rate.remaining,
      rate.resetAt,
    );
  }

  try {
    const body = parseGrowthEventBody((await request.json()) as unknown);
    appendGrowthEvent(body);
    return setRateLimitHeaders(NextResponse.json({ ok: true }), rate.remaining, rate.resetAt);
  } catch (error) {
    if (error instanceof ZodError) {
      return setRateLimitHeaders(NextResponse.json({ error: "이벤트 형식이 올바르지 않습니다." }, { status: 400 }), rate.remaining, rate.resetAt);
    }
    return setRateLimitHeaders(NextResponse.json({ error: "이벤트 저장 중 오류가 발생했습니다." }, { status: 500 }), rate.remaining, rate.resetAt);
  }
}
