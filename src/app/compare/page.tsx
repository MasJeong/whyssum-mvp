import ProgressBar from "@/components/progress-bar";
import { trendData } from "@/lib/mvp-data";

const compareItems = [
  { name: "Node.js", adoption: 44, growth: 7, difficulty: 35, complexity: 46, cost: 41 },
  { name: "Spring Boot", adoption: 31, growth: 4, difficulty: 58, complexity: 63, cost: 54 },
  { name: "Go", adoption: 16, growth: 9, difficulty: 62, complexity: 55, cost: 38 },
];

export default function ComparePage() {
  const backendAvg = Math.round(
    trendData.backend.reduce((sum, row) => sum + row.demandIndex, 0) / trendData.backend.length,
  );

  return (
    <main className="container">
      <section className="card">
        <p className="eyebrow">비교</p>
        <h1>같은 상황에서 무엇이 더 맞는지 비교</h1>
        <p>초기 MVP에서는 백엔드 대표 기술 3개를 기준으로 비교 예시를 제공합니다.</p>
      </section>

      <section className="card">
        <h2>비교 결과</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>기술</th>
                <th>채택률</th>
                <th>성장률</th>
                <th>러닝커브</th>
                <th>운영복잡도</th>
                <th>비용부담</th>
              </tr>
            </thead>
            <tbody>
              {compareItems.map((item) => (
                <tr key={item.name}>
                  <td>{item.name}</td>
                  <td>{item.adoption}%</td>
                  <td>+{item.growth}%</td>
                  <td>
                    <ProgressBar value={item.difficulty} />
                  </td>
                  <td>
                    <ProgressBar value={item.complexity} />
                  </td>
                  <td>
                    <ProgressBar value={item.cost} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid grid-2">
        <article className="card">
          <h2>빠른 출시 우선</h2>
          <p>NestJS/Node 계열이 개발 속도와 팀 온보딩에서 유리합니다.</p>
        </article>
        <article className="card">
          <h2>확장성 우선</h2>
          <p>Go/Spring 계열이 장기 확장성에서 강점을 보입니다. 백엔드 평균 수요지수는 {backendAvg}점입니다.</p>
        </article>
      </section>
    </main>
  );
}
