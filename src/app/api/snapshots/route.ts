import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { saveShareSnapshot } from "@/lib/share-snapshot-store";
import { parseCreateSnapshotBody } from "@/lib/security/validation";

/**
 * 공유용 결과 스냅샷을 생성한다.
 * @param request HTTP 요청 객체
 * @returns 생성된 스냅샷 ID
 */
export async function POST(request: Request) {
  try {
    const snapshot = saveShareSnapshot(parseCreateSnapshotBody((await request.json()) as unknown));
    return NextResponse.json({ snapshotId: snapshot.id, kind: snapshot.kind, expiresAt: snapshot.expiresAt });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "공유 스냅샷 형식이 올바르지 않습니다." }, { status: 400 });
    }
    return NextResponse.json({ error: "스냅샷 생성 중 오류가 발생했습니다." }, { status: 500 });
  }
}
