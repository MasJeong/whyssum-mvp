import Link from "next/link";
import { notFound } from "next/navigation";
import { recommendations, roles, scenarios, type RoleKey } from "@/lib/mvp-data";

type PageProps = {
  params: Promise<{ role: string }>;
};

export default async function ScenarioPage({ params }: PageProps) {
  const { role } = await params;
  const roleKey = role as RoleKey;
  const roleInfo = roles.find((item) => item.key === roleKey);

  if (!roleInfo) {
    notFound();
  }

  const roleScenarios = scenarios.filter((item) => item.role === roleKey);
  const picks = recommendations[roleKey];

  return (
    <main className="container">
      <section className="card">
        <p className="eyebrow">상황추천</p>
        <h1>{roleInfo.name}</h1>
        <p>같은 직무라도 팀 크기와 일정, 우선순위에 따라 추천안이 달라집니다.</p>
      </section>

      <section className="card">
        <h2>자주 찾는 상황</h2>
        <div className="chip-row">
          {roleScenarios.map((item) => (
            <span className="chip" key={item.id}>
              {item.teamSize} · {item.timeline} · {item.priority}
            </span>
          ))}
        </div>
      </section>

      <section className="grid grid-3">
        {picks.map((pick) => (
          <article className="card" key={pick.label}>
            <p className="eyebrow">{pick.label}</p>
            <h2>{pick.stack}</h2>
            <p>적합도 {pick.fitScore}점</p>
            <p className="list-title">장점</p>
            <ul>
              {pick.pros.map((pro) => (
                <li key={pro}>{pro}</li>
              ))}
            </ul>
            <p className="list-title">리스크</p>
            <ul>
              {pick.risks.map((risk) => (
                <li key={risk}>{risk}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <section className="card">
        <Link href="/compare" className="button button-primary">
          추천안 비교하기
        </Link>
      </section>
    </main>
  );
}
