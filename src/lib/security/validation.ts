import { z } from "zod";
import { growthEventSchema } from "@/lib/growth-events";
import { createSnapshotBodySchema } from "@/lib/share-snapshots";

export const recommendationQuerySchema = z.object({
  role: z.enum(["backend", "designer", "pm"]),
  teamSize: z
    .string()
    .trim()
    .min(1)
    .max(24)
    .regex(/^[\w\s~+\-가-힣]+$/u)
    .optional(),
  timeline: z
    .string()
    .trim()
    .min(1)
    .max(24)
    .regex(/^[\w\s~+\-가-힣]+$/u)
    .optional(),
  priority: z
    .string()
    .trim()
    .min(1)
    .max(24)
    .regex(/^[\w\s~+\-가-힣]+$/u)
    .optional(),
});

export type RecommendationQuery = z.infer<typeof recommendationQuerySchema>;

export const subscribeBodySchema = z.object({
  email: z.string().trim().email().max(120),
});

export type SubscribeBody = z.infer<typeof subscribeBodySchema>;

export const growthWindowSchema = z.enum(["d1", "d7", "d30"]);

export type GrowthWindow = z.infer<typeof growthWindowSchema>;

/**
 * 추천 API 쿼리 문자열을 스키마로 검증해 안전한 입력 객체로 변환한다.
 * @param params URL 검색 파라미터
 * @returns 검증된 추천 쿼리 객체
 */
export function parseRecommendationQuery(params: URLSearchParams): RecommendationQuery {
  const payload = {
    role: params.get("role"),
    teamSize: params.get("teamSize") ?? undefined,
    timeline: params.get("timeline") ?? undefined,
    priority: params.get("priority") ?? undefined,
  };

  return recommendationQuerySchema.parse(payload);
}

/**
 * 구독 요청 바디를 검증한다.
 * @param body 요청 바디 원문
 * @returns 검증된 구독 바디
 */
export function parseSubscribeBody(body: unknown): SubscribeBody {
  return subscribeBodySchema.parse(body);
}

/**
 * 성장 이벤트 요청 바디를 검증한다.
 * @param body 요청 바디 원문
 * @returns 검증된 성장 이벤트
 */
export function parseGrowthEventBody(body: unknown) {
  return growthEventSchema.parse(body);
}

/**
 * 공유 스냅샷 생성 바디를 검증한다.
 * @param body 요청 바디 원문
 * @returns 검증된 스냅샷 생성 입력
 */
export function parseCreateSnapshotBody(body: unknown) {
  return createSnapshotBodySchema.parse(body);
}

/**
 * KPI 윈도우 문자열을 검증한다.
 * @param value 쿼리 파라미터 값
 * @returns 검증된 KPI 윈도우
 */
export function parseGrowthWindow(value: string | null): GrowthWindow {
  return growthWindowSchema.parse(value ?? "d7");
}
