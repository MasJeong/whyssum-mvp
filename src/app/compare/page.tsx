import CompareInteractive from "@/components/compare-interactive";
import { trendData } from "@/lib/mvp-data";

export default function ComparePage() {
  const backendAvg = Math.round(
    trendData.backend.reduce((sum, row) => sum + row.demandIndex, 0) / trendData.backend.length,
  );

  return (
    <main className="container page">
      <section className="card">
        <p className="eyebrow">비교</p>
        <h1>같은 상황에서 무엇이 더 맞는지 비교</h1>
        <p className="muted">초기 MVP에서는 백엔드 대표 기술 3개를 기준으로 비교 예시를 제공합니다.</p>
      </section>

      <CompareInteractive />

      <section className="grid grid-2">
        <article className="card">
          <h2>빠른 출시 우선</h2>
          <p className="muted">NestJS/Node 계열이 개발 속도와 팀 온보딩에서 유리합니다.</p>
        </article>
        <article className="card">
          <h2>확장성 우선</h2>
          <p className="muted">
            Go/Spring 계열이 장기 확장성에서 강점을 보입니다. 백엔드 평균 수요지수는 {backendAvg}점입니다.
          </p>
        </article>
      </section>
    </main>
  );
}
