import Link from "next/link";
import { notFound } from "next/navigation";
import ProgressBar from "@/components/progress-bar";
import { getRoleTrendMetrics } from "@/lib/live-role-trends";
import { roles, sourceNote, type RoleKey } from "@/lib/mvp-data";

type PageProps = {
  params: Promise<{ role: string }>;
};

export default async function TrendByRolePage({ params }: PageProps) {
  const { role } = await params;
  const roleKey = role as RoleKey;
  const roleInfo = roles.find((item) => item.key === roleKey);

  if (!roleInfo) {
    notFound();
  }

  const trendResult = await getRoleTrendMetrics(roleKey);
  const metrics = trendResult.metrics;
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
      <section className="card">
        <p className="eyebrow">직무별 트렌드</p>
        <h1>{roleInfo.name}</h1>
        <p className="muted">{roleInfo.oneLiner}</p>
        <div className="chip-row" style={{ marginTop: "0.45rem" }}>
          <span className="chip">데이터 모드: {trendResult.mode === "live" ? "LIVE" : "FALLBACK"}</span>
          <span className="chip">소스: {trendResult.source}</span>
        </div>
        <div className="role-switch" style={{ marginTop: "0.75rem" }}>
          {roles.map((item) => (
            <Link
              key={item.key}
              href={`/trends/${item.key}`}
              className={`role-pill ${item.key === roleKey ? "role-pill-active" : ""}`}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </section>

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
                <th>난이도</th>
              </tr>
            </thead>
            <tbody>
              {metrics.map((row) => (
                <tr key={row.tool}>
                  <td>{row.tool}</td>
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
          <p className="muted" style={{ marginTop: "0.25rem" }}>
            최신 갱신: {new Date(trendResult.fetchedAt).toLocaleString("ko-KR")}
          </p>
        </div>
        <Link href={`/scenarios/${roleKey}`} className="button button-primary">
          이 직무 상황추천 보기
        </Link>
      </section>
    </main>
  );
}
