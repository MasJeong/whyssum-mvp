import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { recommendations, scenarios, sourceNote, type RoleKey } from "@/lib/mvp-data";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit";
import { parseRecommendationQuery } from "@/lib/security/validation";

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_PER_WINDOW = 30;

function setRateLimitHeaders(response: NextResponse, remaining: number, resetAt: number) {
  response.headers.set("X-RateLimit-Limit", String(RATE_LIMIT_PER_WINDOW));
  response.headers.set("X-RateLimit-Remaining", String(Math.max(0, remaining)));
  response.headers.set("X-RateLimit-Reset", String(Math.floor(resetAt / 1000)));
  return response;
}

export async function GET(request: Request) {
  const ip = getClientIp(request.headers.get("x-forwarded-for")?.split(",")[0] ?? null);
  const rate = checkRateLimit(`recommendations:${ip}`, {
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
    const url = new URL(request.url);
    const query = parseRecommendationQuery(url.searchParams);

    const role = query.role as RoleKey;
    const roleRecommendations = recommendations[role];
    const matchedScenarios = scenarios.filter((item) => item.role === role);

    const response = NextResponse.json({
      role,
      filters: {
        teamSize: query.teamSize ?? null,
        timeline: query.timeline ?? null,
        priority: query.priority ?? null,
      },
      recommendations: roleRecommendations,
      scenarios: matchedScenarios,
      sourceNote,
    });

    return setRateLimitHeaders(response, rate.remaining, rate.resetAt);
  } catch (error) {
    if (error instanceof ZodError) {
      const badRequest = NextResponse.json(
        {
          error: "요청 파라미터가 유효하지 않습니다.",
          details: error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message })),
        },
        { status: 400 },
      );

      return setRateLimitHeaders(badRequest, rate.remaining, rate.resetAt);
    }

    const internalError = NextResponse.json(
      { error: "서버에서 요청 처리 중 문제가 발생했습니다." },
      { status: 500 },
    );
    return setRateLimitHeaders(internalError, rate.remaining, rate.resetAt);
  }
}
