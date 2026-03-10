import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AdSlot from "@/components/ad-slot";
import PageVisitTracker from "@/components/page-visit-tracker";
import ProgressBar from "@/components/progress-bar";
import RelatedContentSection from "@/components/related-content-section";
import TrackedLink from "@/components/tracked-link";
import WatchlistToggle from "@/components/watchlist-toggle";
import { getRoleTrendMetrics } from "@/lib/live-role-trends";
import { roles, sourceNote, type RoleKey } from "@/lib/mvp-data";

type SortBy = "adoption" | "demand" | "growth" | "confidence";

const sortOptions: Array<{ key: SortBy; label: string }> = [
  { key: "adoption", label: "채택률" },
  { key: "demand", label: "수요지수" },
  { key: "growth", label: "성장률" },
  { key: "confidence", label: "신뢰도" },
];

/**
 * 트렌드 정렬 쿼리를 검증해 허용값만 통과시킨다.
 * @param value URL query sortBy 값
 * @returns 허용 정렬 키 또는 기본값(adoption)
 */
function parseSortBy(value?: string): SortBy {
  if (value && sortOptions.some((option) => option.key === value)) {
    return value as SortBy;
  }
  return "adoption";
}

/**
 * 정렬 기준별 비교값을 계산한다.
 * @param sortBy 정렬 기준
 * @param left 왼쪽 행
 * @param right 오른쪽 행
 * @returns sort 비교값
 */
function compareMetric(
  sortBy: SortBy,
  left: Awaited<ReturnType<typeof getRoleTrendMetrics>>["metrics"][number],
  right: Awaited<ReturnType<typeof getRoleTrendMetrics>>["metrics"][number],
) {
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

/** 트렌드 페이지 컴포넌트 props (Next.js 15+ params/searchParams는 Promise) */
type PageProps = {
  params: Promise<{ role: string }>;
  searchParams: Promise<{ topN?: string; sortBy?: string }>;
};

/**
 * 직무별 트렌드 페이지 메타데이터를 생성한다.
 * @param params 동적 라우트 파라미터
 * @returns 메타데이터
 */
export async function generateMetadata({ params }: Pick<PageProps, "params">): Promise<Metadata> {
  const { role } = await params;
  const roleKey = role as RoleKey;
  const roleInfo = roles.find((item) => item.key === roleKey);

  if (!roleInfo) {
    return {
      title: "트렌드",
      description: "직무별 트렌드 데이터",
    };
  }

  return {
    title: `${roleInfo.name} 트렌드`,
    description: `${roleInfo.name} 관점에서 채택률·성장률·수요지수를 확인하는 트렌드 페이지`,
    alternates: {
      canonical: `/trends/${roleKey}`,
    },
  };
}

/**
 * 직무별 트렌드 상세 페이지를 렌더링한다.
 * @param params 동적 라우트 파라미터
 * @param searchParams 쿼리 파라미터(topN)
 * @returns 트렌드 페이지 UI
 */
export default async function TrendByRolePage({ params, searchParams }: PageProps) {
  const { role } = await params;
  const query = await searchParams;
  const roleKey = role as RoleKey;
  const roleInfo = roles.find((item) => item.key === roleKey);

  if (!roleInfo) {
    notFound();
  }

  const trendResult = await getRoleTrendMetrics(roleKey);
  const sortBy = parseSortBy(query.sortBy);
  const sortedMetrics = [...trendResult.metrics].sort((left, right) => {
    const compared = compareMetric(sortBy, left, right);
    if (compared !== 0) {
      return compared;
    }
    return left.tool.localeCompare(right.tool);
  });
  const topNCandidate = Number(query.topN ?? 8);
  const topN = Number.isFinite(topNCandidate) && topNCandidate > 0 ? topNCandidate : 8;
  const metrics = sortedMetrics.slice(0, Math.min(topN, sortedMetrics.length));
  const average = {
    adoption: Math.round(metrics.reduce((sum, row) => sum + row.adoptionRate, 0) / metrics.length),
    growth: Math.round(metrics.reduce((sum, row) => sum + row.growthRate, 0) / metrics.length),
    demand: Math.round(metrics.reduce((sum, row) => sum + row.demandIndex, 0) / metrics.length),
    activity: Math.round(
      metrics.reduce((sum, row) => sum + (row.activityScore ?? row.growthRate * 3), 0) / metrics.length,
    ),
    community: Math.round(
      metrics.reduce((sum, row) => sum + (row.communityScore ?? row.demandIndex), 0) / metrics.length,
    ),
    stability: Math.round(
      metrics.reduce((sum, row) => sum + (row.stabilityScore ?? row.demandIndex), 0) / metrics.length,
    ),
  };

  return (
    <main className="container page">
      <PageVisitTracker page="trends" meta={{ role: roleKey, topN, sortBy }} />
      <section className="card">
        <p className="eyebrow">직무별 트렌드</p>
        <h1>{roleInfo.name}</h1>
        <p className="muted readable">{roleInfo.oneLiner}</p>
        <div className="chip-row mt-sm">
          <span className="chip">데이터 신뢰 상태: {trendResult.mode === "live" ? "실시간 수집" : "안정 모드"}</span>
          <span className="chip">소스: {trendResult.source}</span>
        </div>
        <div className="role-switch mt-md">
          {roles.map((item) => (
            <TrackedLink
              key={item.key}
              href={`/trends/${item.key}`}
              className={`role-pill ${item.key === roleKey ? "role-pill-active" : ""}`}
              eventName="trend_click"
              eventPage="trends"
              eventMeta={{ role: item.key, cta: "role-switch" }}
            >
              {item.name}
            </TrackedLink>
          ))}
        </div>
        <div className="topn-switch mt-md">
          {[5, 8, 12].map((size) => (
            <TrackedLink
              key={size}
              href={`/trends/${roleKey}?topN=${size}&sortBy=${sortBy}`}
              className={`role-pill ${topN === size ? "role-pill-active" : ""}`}
              eventName="trend_click"
              eventPage="trends"
              eventMeta={{ role: roleKey, topN: size, cta: "topn-switch" }}
            >
              TOP {size}
            </TrackedLink>
          ))}
        </div>
        <div className="topn-switch mt-sm">
          {sortOptions.map((option) => (
            <TrackedLink
              key={option.key}
              href={`/trends/${roleKey}?topN=${topN}&sortBy=${option.key}`}
              className={`role-pill ${sortBy === option.key ? "role-pill-active" : ""}`}
              eventName="trend_click"
              eventPage="trends"
              eventMeta={{ role: roleKey, sortBy: option.key, cta: "sort-switch" }}
            >
              {option.label}
            </TrackedLink>
          ))}
        </div>
      </section>

      <AdSlot slotId={`trends-inline-${roleKey}`} variant="inline" label="스폰서 리포트" />

      <section className="grid grid-3">
        <article className="card kpi">
          <p>평균 채택률</p>
          <strong>{average.adoption}%</strong>
          <small>해당 직무의 기술 사용 비중 평균</small>
        </article>
        <article className="card kpi">
          <p>평균 성장률</p>
          <strong>{average.growth}%</strong>
          <small>전년 대비 상승 속도</small>
        </article>
        <article className="card kpi">
          <p>평균 수요지수</p>
          <strong>{average.demand}</strong>
          <small>채용/실무 요구 통합 지수</small>
        </article>
        <article className="card kpi">
          <p>활동 지수</p>
          <strong>{average.activity}</strong>
          <small>최근 30일 커밋/기여자 반영</small>
        </article>
        <article className="card kpi">
          <p>커뮤니티 지수</p>
          <strong>{average.community}</strong>
          <small>리포지토리 규모 기반</small>
        </article>
        <article className="card kpi">
          <p>안정성 지수</p>
          <strong>{average.stability}</strong>
          <small>커뮤니티 + 활동 결합</small>
        </article>
      </section>

      <section className="card">
        <h2>도구/기술별 지표</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>기술</th>
                <th>채택률</th>
                <th>성장률</th>
                <th>수요지수</th>
                <th>활동지수</th>
                <th>커뮤니티</th>
                <th>안정성</th>
                <th>신뢰도</th>
                <th>추세(6개월)</th>
                <th>난이도</th>
              </tr>
            </thead>
            <tbody>
              {metrics.map((row) => (
                <tr key={row.tool}>
                  <td>
                    <div className="tool-cell">
                      <span>{row.tool}</span>
                      <WatchlistToggle itemKey={`${roleKey}:${row.tool}`} label={row.tool} />
                    </div>
                  </td>
                  <td>
                    <div className="meter-cell">
                      <span>{row.adoptionRate}%</span>
                      <ProgressBar value={row.adoptionRate} />
                    </div>
                  </td>
                  <td>{row.growthRate > 0 ? `+${row.growthRate}%` : `${row.growthRate}%`}</td>
                  <td>{row.demandIndex}</td>
                  <td>{row.activityScore ?? Math.round(row.growthRate * 3)}</td>
                  <td>{row.communityScore ?? row.demandIndex}</td>
                  <td>{row.stabilityScore ?? row.demandIndex}</td>
                  <td>
                    <span className={`trust-badge trust-${(row.trustLevel ?? "Medium").toLowerCase()}`}>
                      {row.trustLevel ?? "Medium"} ({row.confidenceScore ?? 60})
                    </span>
                    <div className="mini-source">{(row.sources ?? []).join(", ")}</div>
                  </td>
                  <td>
                    <div className="sparkline" aria-label="6개월 추세">
                      {(row.trendSeries ?? []).map((point, idx) => (
                        <span key={`${row.tool}-${idx}`} style={{ height: `${Math.max(12, point)}%` }} />
                      ))}
                    </div>
                  </td>
                  <td>{row.difficulty}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card split-note">
        <div>
          <p className="muted">{sourceNote}</p>
          <p className="muted mt-sm">
            최신 갱신: {new Date(trendResult.fetchedAt).toLocaleString("ko-KR")}
          </p>
        </div>
        <TrackedLink href={`/scenarios/${roleKey}`} className="button button-primary" eventName="scenario_click" eventPage="trends" eventMeta={{ role: roleKey, cta: "trends-to-scenarios" }}>
          <span className="button-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 4.5l1.9 3.8 4.2.6-3 2.9.7 4.2L12 14l-3.8 2 .7-4.2-3-2.9 4.2-.6L12 4.5z" />
            </svg>
          </span>
          이 직무 상황추천 보기
        </TrackedLink>
      </section>

      <RelatedContentSection context={{ page: "trends", role: roleKey }} />
    </main>
  );
}
