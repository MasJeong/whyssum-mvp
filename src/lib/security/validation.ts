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

export function parseRecommendationQuery(params: URLSearchParams): RecommendationQuery {
  const payload = {
    role: params.get("role"),
    teamSize: params.get("teamSize") ?? undefined,
    timeline: params.get("timeline") ?? undefined,
    priority: params.get("priority") ?? undefined,
  };

  return recommendationQuerySchema.parse(payload);
}
