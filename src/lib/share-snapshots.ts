import { z } from "zod";

export const snapshotKindSchema = z.enum(["scenario", "compare"]);
export type SnapshotKind = z.infer<typeof snapshotKindSchema>;

export const scenarioSharePayloadSchema = z.object({
  role: z.enum(["backend", "designer", "pm"]),
  teamSize: z.string().trim().min(1).max(24),
  timeline: z.string().trim().min(1).max(24),
  priority: z.string().trim().min(1).max(24),
});

export const compareSharePayloadSchema = z.object({
  role: z.enum(["backend", "designer", "pm"]),
  selected: z.array(z.string().trim().min(1).max(60)).min(1).max(4),
});

export const createSnapshotBodySchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("scenario"), payload: scenarioSharePayloadSchema }),
  z.object({ kind: z.literal("compare"), payload: compareSharePayloadSchema }),
]);

export type ScenarioSharePayload = z.infer<typeof scenarioSharePayloadSchema>;
export type CompareSharePayload = z.infer<typeof compareSharePayloadSchema>;
export type CreateSnapshotBody = z.infer<typeof createSnapshotBodySchema>;

export type StoredSnapshot = {
  id: string;
  kind: SnapshotKind;
  createdAt: number;
  expiresAt: number;
  payload: ScenarioSharePayload | CompareSharePayload;
};

export const SNAPSHOT_TTL_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * 공유 스냅샷 ID를 생성한다.
 * @returns 짧은 스냅샷 ID
 */
export function createShareSnapshotId() {
  return Math.random().toString(36).slice(2, 10);
}
