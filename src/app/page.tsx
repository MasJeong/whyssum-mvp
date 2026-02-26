const cards = [
  { role: "백엔드", trend: "TypeScript +12%" },
  { role: "프론트엔드", trend: "Next.js +18%" },
  { role: "디자이너", trend: "Figma AI +9%" },
  { role: "의료", trend: "EMR 자동화 +7%" },
];

export default function Home() {
  return (
    <main className="container">
      <section className="card" style={{ marginBottom: "1rem" }}>
        <h1 style={{ margin: 0, fontSize: "2rem" }}>직무핑</h1>
        <p style={{ marginTop: "0.5rem", marginBottom: 0 }}>
          직무별 기술 트렌드를 빠르게 읽는 데이터 리포트 MVP
        </p>
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "0.75rem",
        }}
      >
        {cards.map((item) => (
          <article key={item.role} className="card">
            <h2 style={{ margin: 0, fontSize: "1rem" }}>{item.role}</h2>
            <p style={{ marginTop: "0.5rem", color: "var(--accent)" }}>{item.trend}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
