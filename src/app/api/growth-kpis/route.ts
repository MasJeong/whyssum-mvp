import { NextResponse } from "next/server";
import { getGrowthKpiReport } from "@/lib/growth-store";
import { parseGrowthWindow } from "@/lib/security/validation";

/**
 * 최근 성장 KPI 리포트를 반환한다.
 * @param request HTTP 요청 객체
 * @returns KPI 리포트 응답
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const window = parseGrowthWindow(url.searchParams.get("window"));
    return NextResponse.json(getGrowthKpiReport(window));
  } catch {
    return NextResponse.json({ error: "유효한 KPI window가 아닙니다." }, { status: 400 });
  }
}
