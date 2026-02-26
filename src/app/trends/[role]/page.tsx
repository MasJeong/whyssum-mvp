import Link from "next/link";
import { notFound } from "next/navigation";
import ProgressBar from "@/components/progress-bar";
import { roles, sourceNote, trendData, type RoleKey } from "@/lib/mvp-data";

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

  const metrics = trendData[roleKey];

  return (
    <main className="container">
      <section className="card">
        <p className="eyebrow">직무별 트렌드</p>
        <h1>{roleInfo.name}</h1>
        <p>{roleInfo.oneLiner}</p>
      </section>

      <section className="grid grid-4">
        <article className="card stat">
          <p>평균 채택률</p>
          <strong>{Math.round(metrics.reduce((sum, row) => sum + row.adoptionRate, 0) / metrics.length)}%</strong>
        </article>
        <article className="card stat">
          <p>평균 성장률</p>
          <strong>{Math.round(metrics.reduce((sum, row) => sum + row.growthRate, 0) / metrics.length)}%</strong>
        </article>
        <article className="card stat">
          <p>평균 수요지수</p>
          <strong>{Math.round(metrics.reduce((sum, row) => sum + row.demandIndex, 0) / metrics.length)}</strong>
        </article>
        <article className="card stat">
          <p>데이터 시점</p>
          <strong>2026.02</strong>
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
                  <td>{row.difficulty}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card muted-note">
        <p>{sourceNote}</p>
        <Link href={`/scenarios/${roleKey}`} className="text-link">
          이 직무 상황추천 보러가기
        </Link>
      </section>
    </main>
  );
}
