import { NextResponse } from "next/server";
import { getRoleTrendMetrics } from "@/lib/live-role-trends";
import { type RoleKey } from "@/lib/mvp-data";

type SortBy = "adoption" | "demand" | "growth" | "confidence";

const allowedSortBy: SortBy[] = ["adoption", "demand", "growth", "confidence"];

/**
 * 쿼리 파라미터로 전달된 정렬 기준을 검증한다.
 * @param value URL query sortBy 값
 * @returns 허용된 정렬 키 또는 기본값(adoption)
 */
function parseSortBy(value: string | null): SortBy {
  if (value && allowedSortBy.includes(value as SortBy)) {
    return value as SortBy;
  }
  return "adoption";
}

/**
 * 지정한 기준으로 지표 배열을 내림차순 정렬한다.
 * @param sortBy 정렬 기준
 * @param left 좌측 비교 대상
 * @param right 우측 비교 대상
 * @returns 정렬 비교값
 */
function compareMetric(sortBy: SortBy, left: Awaited<ReturnType<typeof getRoleTrendMetrics>>["metrics"][number], right: Awaited<ReturnType<typeof getRoleTrendMetrics>>["metrics"][number]) {
  switch (sortBy) {
    case "demand":
      return right.demandIndex - left.demandIndex;
    case "growth":
      return right.growthRate - left.growthRate;
    case "confidence":
      return (right.confidenceScore ?? 0) - (left.confidenceScore ?? 0);
    case "adoption":
    default:
      return right.adoptionRate - left.adoptionRate;
  }
}

/** GET 핸들러 두 번째 인자 (동적 라우트 params) */
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
  const searchParams = new URL(_request.url).searchParams;
  const sortBy = parseSortBy(searchParams.get("sortBy"));
  const { role } = await params;
  const roleKey = role as RoleKey;

  if (!(["backend", "designer", "pm"] as string[]).includes(roleKey)) {
    return NextResponse.json({ error: "지원하지 않는 role입니다." }, { status: 400 });
  }

  const result = await getRoleTrendMetrics(roleKey);
  const metrics = [...result.metrics].sort((left, right) => {
    const compared = compareMetric(sortBy, left, right);
    if (compared !== 0) {
      return compared;
    }
    return left.tool.localeCompare(right.tool);
  });

  return NextResponse.json({ role: roleKey, sortBy, ...result, metrics });
}
