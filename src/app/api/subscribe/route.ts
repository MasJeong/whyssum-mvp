import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit";
import { parseSubscribeBody } from "@/lib/security/validation";

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_PER_WINDOW = 12;
const subscribedEmails = new Set<string>();

/**
 * 구독 API 응답에 요청 제한 헤더를 설정한다.
 * @param response 응답 객체
 * @param remaining 남은 요청 수
 * @param resetAt 제한 리셋 시각(ms)
 * @returns 헤더가 반영된 응답
 */
function setRateLimitHeaders(response: NextResponse, remaining: number, resetAt: number) {
  response.headers.set("X-RateLimit-Limit", String(RATE_LIMIT_PER_WINDOW));
  response.headers.set("X-RateLimit-Remaining", String(Math.max(0, remaining)));
  response.headers.set("X-RateLimit-Reset", String(Math.floor(resetAt / 1000)));
  return response;
}

/**
 * 이메일 구독 요청을 처리한다.
 * @param request HTTP 요청 객체
 * @returns 구독 처리 결과
 */
export async function POST(request: Request) {
  const ip = getClientIp(request.headers.get("x-forwarded-for")?.split(",")[0] ?? null);
  const rate = checkRateLimit(`subscribe:${ip}`, {
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

  try {
    const body = (await request.json()) as unknown;
    const { email } = parseSubscribeBody(body);
    const normalized = email.toLowerCase();

    if (subscribedEmails.has(normalized)) {
      const duplicateResponse = NextResponse.json({ message: "이미 구독된 이메일입니다." });
      return setRateLimitHeaders(duplicateResponse, rate.remaining, rate.resetAt);
    }

    subscribedEmails.add(normalized);
    const successResponse = NextResponse.json({ message: "월간 업데이트 구독이 완료되었습니다." });
    return setRateLimitHeaders(successResponse, rate.remaining, rate.resetAt);
  } catch (error) {
    if (error instanceof ZodError) {
      const badRequest = NextResponse.json({ error: "유효한 이메일 형식이 아닙니다." }, { status: 400 });
      return setRateLimitHeaders(badRequest, rate.remaining, rate.resetAt);
    }

    const internalError = NextResponse.json(
      { error: "서버에서 요청 처리 중 문제가 발생했습니다." },
      { status: 500 },
    );
    return setRateLimitHeaders(internalError, rate.remaining, rate.resetAt);
  }
}
