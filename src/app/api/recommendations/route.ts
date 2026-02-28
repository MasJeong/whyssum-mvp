import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { recommendations, scenarios, sourceNote, trendData, type RoleKey } from "@/lib/mvp-data";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit";
import { parseRecommendationQuery } from "@/lib/security/validation";

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_PER_WINDOW = 30;

// 팀 규모 문자열("1~3명", "5~15명")에서 상한 인원 숫자를 추출해
// 점수 조정 규칙(소규모/대규모 분기)에 사용한다.
function extractMaxTeamSize(value?: string | null): number | null {
  if (!value) return null;
  const numbers = value.match(/\d+/g);
  if (!numbers || numbers.length === 0) return null;
  return Number(numbers[numbers.length - 1]);
}

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

type TrustLevel = "High" | "Medium" | "Low";

type TradeoffAxis = {
  speed: number;
  stability: number;
  scalability: number;
};

type RoleTrendSignals = {
  speed: number;
  stability: number;
  scalability: number;
  topGrowthTool: string;
  avgDemand: number;
};

function computeRoleTrendSignals(role: RoleKey): RoleTrendSignals {
  const metrics = trendData[role];
  if (!metrics || metrics.length === 0) {
    return {
      speed: 60,
      stability: 60,
      scalability: 60,
      topGrowthTool: "핵심 도구",
      avgDemand: 60,
    };
  }

  const avgDemand = metrics.reduce((sum, row) => sum + row.demandIndex, 0) / metrics.length;
  const avgGrowth = metrics.reduce((sum, row) => sum + row.growthRate, 0) / metrics.length;
  const lowDifficultyRatio = metrics.filter((row) => row.difficulty === "낮음").length / metrics.length;
  const mediumOrHighRatio = metrics.filter((row) => row.difficulty !== "낮음").length / metrics.length;
  const topGrowthTool = [...metrics].sort((a, b) => b.growthRate - a.growthRate)[0]?.tool ?? "핵심 도구";

  return {
    speed: clampScore(20 + avgGrowth * 6 + lowDifficultyRatio * 35),
    stability: clampScore(avgDemand * 0.8 + lowDifficultyRatio * 15),
    scalability: clampScore(avgDemand * 0.7 + mediumOrHighRatio * 20 + avgGrowth * 4),
    topGrowthTool,
    avgDemand: clampScore(avgDemand),
  };
}

function getTrustLevel(score: number): TrustLevel {
  if (score >= 80) return "High";
  if (score >= 60) return "Medium";
  return "Low";
}

function getBaseTradeoff(label: "안정형" | "속도형" | "확장형"): TradeoffAxis {
  if (label === "안정형") return { speed: 58, stability: 90, scalability: 72 };
  if (label === "속도형") return { speed: 90, stability: 60, scalability: 63 };
  return { speed: 62, stability: 68, scalability: 93 };
}

function applyTradeoffAdjustments(
  base: TradeoffAxis,
  query: { timeline?: string | null; priority?: string | null },
  maxTeam: number | null,
): TradeoffAxis {
  const adjusted: TradeoffAxis = { ...base };
  const timeline = query.timeline ?? "";
  const priority = query.priority ?? "";

  if (timeline.includes("2개월") || timeline.includes("3개월") || timeline.includes("분기")) {
    adjusted.speed += 8;
    adjusted.scalability -= 4;
  }

  if (timeline.includes("6개월") || timeline.includes("지속")) {
    adjusted.stability += 4;
    adjusted.scalability += 6;
  }

  if (priority.includes("빠른") || priority.includes("실험")) {
    adjusted.speed += 8;
    adjusted.stability -= 3;
  }

  if (priority.includes("확장")) {
    adjusted.scalability += 8;
    adjusted.speed -= 2;
  }

  if (priority.includes("협업") || priority.includes("리포팅")) {
    adjusted.stability += 6;
  }

  if (maxTeam !== null && maxTeam <= 3) {
    adjusted.speed += 6;
    adjusted.scalability -= 5;
  }

  if (maxTeam !== null && maxTeam >= 8) {
    adjusted.scalability += 8;
    adjusted.stability += 4;
    adjusted.speed -= 3;
  }

  return {
    speed: clampScore(adjusted.speed),
    stability: clampScore(adjusted.stability),
    scalability: clampScore(adjusted.scalability),
  };
}

/**
 * confidenceScore는 "현재 적합도" + "역할 트렌드 신호" + "조건 매칭 근거 개수"를 합성한 지표다.
 * 사용자가 결과 신뢰도를 빠르게 판단하도록 단일 점수로 정규화한다.
 */
function computeConfidenceScore(fitScore: number, reasonCount: number, trendSignal: number): number {
  const ruleBonus = Math.min(reasonCount, 5) * 2;
  return clampScore(fitScore * 0.62 + trendSignal * 0.28 + ruleBonus);
}

function buildWhyNow(
  label: "안정형" | "속도형" | "확장형",
  trendSignals: RoleTrendSignals,
  query: { teamSize?: string | null; timeline?: string | null; priority?: string | null },
): string {
  const base =
    label === "속도형"
      ? `최근 ${trendSignals.topGrowthTool} 같은 고성장 흐름에서 빠른 검증과 출시 전환이 유리합니다.`
      : label === "안정형"
        ? `현재 직무 평균 수요지수 ${trendSignals.avgDemand} 기반으로 운영 안정성과 협업 일관성이 중요해졌습니다.`
        : `최근 고성장 스택 비중이 올라 중장기 확장 구조에 선투자할 타이밍입니다.`;

  const filterContext = [query.teamSize, query.timeline, query.priority].filter(
    (item): item is string => typeof item === "string" && item.length > 0,
  );

  if (filterContext.length === 0) {
    return base;
  }

  return `${base} 현재 선택 조건(${filterContext.join(" · ")})과도 일치합니다.`;
}

type ScoredRecommendation = (typeof recommendations)[RoleKey][number] & {
  reasons: string[];
  confidenceScore: number;
  trustLevel: TrustLevel;
  whyNow: string;
  tradeoff: TradeoffAxis;
  baseFitScore: number;
  scoreDelta: number;
  trendSignal: number;
  reasonCount: number;
};

function applyConditionScore(role: RoleKey, query: { teamSize?: string | null; timeline?: string | null; priority?: string | null }) {
  const roleTrendSignals = computeRoleTrendSignals(role);
  const roleRecommendations: ScoredRecommendation[] = recommendations[role].map((item) => ({
    ...item,
    reasons: [],
    confidenceScore: 0,
    trustLevel: "Medium",
    whyNow: "",
    tradeoff: getBaseTradeoff(item.label),
    baseFitScore: item.fitScore,
    scoreDelta: 0,
    trendSignal: 0,
    reasonCount: 0,
  }));
  const adjustments: string[] = [];

  const maxTeam = extractMaxTeamSize(query.teamSize);
  const timeline = query.timeline ?? "";
  const priority = query.priority ?? "";

  for (const item of roleRecommendations) {
    let delta = 0;

    // 아래 규칙들은 "조건 기반 가중치 테이블" 역할을 한다.
    // 같은 직무라도 우선순위/일정/팀규모에 따라 추천 타입(안정형/속도형/확장형)을
    // 동적으로 올리거나 내리기 위해 누적 delta를 계산한다.
    if (priority.includes("빠른") || priority.includes("실험")) {
      if (item.label === "속도형") {
        delta += 14;
        item.reasons.push("빠른 실행/실험 우선 조건에서 속도형 가중치 증가");
      }
      if (item.label === "안정형") delta -= 3;
      if (item.label === "확장형") delta -= 7;
    }

    if (priority.includes("확장")) {
      if (item.label === "확장형") {
        delta += 15;
        item.reasons.push("확장성 우선 조건에서 확장형 가중치 증가");
      }
      if (item.label === "안정형") delta += 2;
      if (item.label === "속도형") delta -= 3;
    }

    if (priority.includes("협업") || priority.includes("리포팅")) {
      if (item.label === "안정형") {
        delta += 10;
        item.reasons.push("협업/리포팅 중심 조건에서 안정형 선호");
      }
      if (item.label === "속도형") delta += 4;
    }

    if (priority.includes("브랜딩")) {
      if (role === "designer" && item.label === "확장형") {
        delta += 14;
        item.reasons.push("디자인 브랜딩 조건에서 확장형 경험 요소 강화");
      }
      if (role === "designer" && item.label === "안정형") delta += 4;
    }

    if (timeline.includes("2개월") || timeline.includes("3개월") || timeline.includes("분기")) {
      if (item.label === "속도형") {
        delta += 8;
        item.reasons.push("단기 일정에서 구현 속도 이점 반영");
      }
      if (item.label === "확장형") delta -= 3;
    }

    if (timeline.includes("6개월") || timeline.includes("지속")) {
      if (item.label === "안정형") {
        delta += 6;
        item.reasons.push("장기 운영 일정에서 안정형 유지보수 이점 반영");
      }
      if (item.label === "확장형") {
        delta += 8;
        item.reasons.push("장기 일정에서 확장 아키텍처 투자 여유 반영");
      }
    }

    if (typeof maxTeam === "number") {
      if (maxTeam <= 3) {
        if (item.label === "속도형") {
          delta += 7;
          item.reasons.push("소규모 팀에서 낮은 복잡도/빠른 온보딩 이점");
        }
        if (item.label === "확장형") delta -= 5;
      }

      if (maxTeam >= 8) {
        if (item.label === "확장형") {
          delta += 9;
          item.reasons.push("대규모 팀에서 확장성 중심 설계 선호");
        }
        if (item.label === "안정형") {
          delta += 6;
          item.reasons.push("대규모 팀 협업에서 안정적 운영 체계 선호");
        }
      }
    }

    item.fitScore = clampScore(item.fitScore + delta);
    if (item.reasons.length === 0) {
      item.reasons.push("기본 직무 추천 가중치 기준");
    }

    const trendSignal =
      item.label === "속도형"
        ? roleTrendSignals.speed
        : item.label === "안정형"
          ? roleTrendSignals.stability
          : roleTrendSignals.scalability;

    item.confidenceScore = computeConfidenceScore(item.fitScore, item.reasons.length, trendSignal);
    item.trustLevel = getTrustLevel(item.confidenceScore);
    item.whyNow = buildWhyNow(item.label, roleTrendSignals, query);
    item.tradeoff = applyTradeoffAdjustments(getBaseTradeoff(item.label), query, maxTeam);
    item.scoreDelta = delta;
    item.trendSignal = trendSignal;
    item.reasonCount = item.reasons.length;
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
    // 의도적으로 상세 스택/내부 정보를 노출하지 않고,
    // 400/500 범주의 안전한 메시지만 내려준다.
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
