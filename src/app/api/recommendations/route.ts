import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { recommendations, scenarios, sourceNote, type RoleKey } from "@/lib/mvp-data";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit";
import { parseRecommendationQuery } from "@/lib/security/validation";

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_PER_WINDOW = 30;

function extractMaxTeamSize(value?: string | null): number | null {
  if (!value) return null;
  const numbers = value.match(/\d+/g);
  if (!numbers || numbers.length === 0) return null;
  return Number(numbers[numbers.length - 1]);
}

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function applyConditionScore(role: RoleKey, query: { teamSize?: string | null; timeline?: string | null; priority?: string | null }) {
  const roleRecommendations = recommendations[role].map((item) => ({ ...item }));
  const adjustments: string[] = [];

  const maxTeam = extractMaxTeamSize(query.teamSize);
  const timeline = query.timeline ?? "";
  const priority = query.priority ?? "";

  for (const item of roleRecommendations) {
    let delta = 0;

    if (priority.includes("빠른") || priority.includes("실험")) {
      if (item.label === "속도형") delta += 14;
      if (item.label === "안정형") delta -= 3;
      if (item.label === "확장형") delta -= 7;
    }

    if (priority.includes("확장")) {
      if (item.label === "확장형") delta += 15;
      if (item.label === "안정형") delta += 2;
      if (item.label === "속도형") delta -= 3;
    }

    if (priority.includes("협업") || priority.includes("리포팅")) {
      if (item.label === "안정형") delta += 10;
      if (item.label === "속도형") delta += 4;
    }

    if (priority.includes("브랜딩")) {
      if (role === "designer" && item.label === "확장형") delta += 14;
      if (role === "designer" && item.label === "안정형") delta += 4;
    }

    if (timeline.includes("2개월") || timeline.includes("3개월") || timeline.includes("분기")) {
      if (item.label === "속도형") delta += 8;
      if (item.label === "확장형") delta -= 3;
    }

    if (timeline.includes("6개월") || timeline.includes("지속")) {
      if (item.label === "안정형") delta += 6;
      if (item.label === "확장형") delta += 8;
    }

    if (typeof maxTeam === "number") {
      if (maxTeam <= 3) {
        if (item.label === "속도형") delta += 7;
        if (item.label === "확장형") delta -= 5;
      }

      if (maxTeam >= 8) {
        if (item.label === "확장형") delta += 9;
        if (item.label === "안정형") delta += 6;
      }
    }

    item.fitScore = clampScore(item.fitScore + delta);
  }

  if (query.teamSize) adjustments.push(`팀 규모: ${query.teamSize}`);
  if (query.timeline) adjustments.push(`일정: ${query.timeline}`);
  if (query.priority) adjustments.push(`우선순위: ${query.priority}`);

  roleRecommendations.sort((a, b) => b.fitScore - a.fitScore);
  return { roleRecommendations, adjustments };
}

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
    const { roleRecommendations, adjustments } = applyConditionScore(role, {
      teamSize: query.teamSize,
      timeline: query.timeline,
      priority: query.priority,
    });
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
      appliedRules: adjustments,
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
