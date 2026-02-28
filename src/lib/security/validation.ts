import { z } from "zod";

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
