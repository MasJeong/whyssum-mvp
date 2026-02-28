import { NextResponse } from "next/server";
import { getRoleTrendMetrics } from "@/lib/live-role-trends";
import { type RoleKey } from "@/lib/mvp-data";

type Params = {
  params: Promise<{ role: string }>;
};

/**
 * 직무별 트렌드 API 진입점으로 role 파라미터를 검증 후 지표를 반환한다.
 * @param _request HTTP 요청 객체
 * @param params 동적 라우트 파라미터
 * @returns 직무별 트렌드 응답
 */
export async function GET(_request: Request, { params }: Params) {
  const { role } = await params;
  const roleKey = role as RoleKey;

  if (!(["backend", "designer", "pm"] as string[]).includes(roleKey)) {
    return NextResponse.json({ error: "지원하지 않는 role입니다." }, { status: 400 });
  }

  const result = await getRoleTrendMetrics(roleKey);
  return NextResponse.json({ role: roleKey, ...result });
}
