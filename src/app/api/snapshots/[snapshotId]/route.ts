import { NextResponse } from "next/server";
import { readShareSnapshot } from "@/lib/share-snapshot-store";

type RouteProps = {
  params: Promise<{ snapshotId: string }>;
};

/**
 * 공유 스냅샷을 조회한다.
 * @param params 동적 라우트 파라미터
 * @returns 스냅샷 응답
 */
export async function GET(_: Request, { params }: RouteProps) {
  const { snapshotId } = await params;
  const snapshot = readShareSnapshot(snapshotId);
  if (!snapshot) {
    return NextResponse.json({ error: "공유 스냅샷을 찾을 수 없습니다." }, { status: 404 });
  }
  return NextResponse.json(snapshot);
}
