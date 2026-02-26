import { insightCards } from "@/lib/mvp-data";

export default function InsightsPage() {
  return (
    <main className="container">
      <section className="card">
        <p className="eyebrow">월간 인사이트</p>
        <h1>요즘 왜 이걸 쓰는지 요약</h1>
        <p>긴 리포트를 읽기 전에 핵심 변화만 먼저 확인할 수 있도록 가볍게 정리했습니다.</p>
      </section>

      <section className="grid grid-3">
        {insightCards.map((card) => (
          <article key={card.title} className="card">
            <h2>{card.title}</h2>
            <p>{card.body}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
