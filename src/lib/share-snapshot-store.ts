import { SNAPSHOT_TTL_MS, type CreateSnapshotBody, type StoredSnapshot, createShareSnapshotId } from "@/lib/share-snapshots";

const snapshotStore = new Map<string, StoredSnapshot>();

/**
 * 만료된 스냅샷을 메모리 저장소에서 제거한다.
 * @returns 없음
 */
function pruneExpiredSnapshots() {
  const now = Date.now();
  for (const [key, value] of snapshotStore.entries()) {
    if (value.expiresAt <= now) {
      snapshotStore.delete(key);
    }
  }
}

/**
 * 공유 스냅샷을 저장하고 식별자를 반환한다.
 * @param input 저장할 스냅샷 입력
 * @returns 저장된 스냅샷
 */
export function saveShareSnapshot(input: CreateSnapshotBody): StoredSnapshot {
  pruneExpiredSnapshots();
  const now = Date.now();
  const snapshot: StoredSnapshot = {
    id: createShareSnapshotId(),
    kind: input.kind,
    createdAt: now,
    expiresAt: now + SNAPSHOT_TTL_MS,
    payload: input.payload,
  };
  snapshotStore.set(snapshot.id, snapshot);
  return snapshot;
}

/**
 * 스냅샷 ID로 저장된 공유 스냅샷을 조회한다.
 * @param snapshotId 조회할 스냅샷 ID
 * @returns 저장된 스냅샷 또는 null
 */
export function readShareSnapshot(snapshotId: string) {
  pruneExpiredSnapshots();
  const hit = snapshotStore.get(snapshotId);
  if (!hit) return null;
  if (hit.expiresAt <= Date.now()) {
    snapshotStore.delete(snapshotId);
    return null;
  }
  return hit;
}
