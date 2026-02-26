import Link from "next/link";
import { roles } from "@/lib/mvp-data";

export default function RolesPage() {
  return (
    <main className="container">
      <section className="card">
        <p className="eyebrow">직무 허브</p>
        <h1>어떤 직무 관점에서 볼까?</h1>
        <p>직무마다 중요한 의사결정 기준이 달라서, 같은 도구도 추천 결과가 다르게 나옵니다.</p>
      </section>

      <section className="grid grid-3">
        {roles.map((role) => (
          <article className="card" key={role.key}>
            <h2>{role.name}</h2>
            <p>{role.oneLiner}</p>
            <div className="button-row">
              <Link className="button button-ghost" href={`/trends/${role.key}`}>
                트렌드
              </Link>
              <Link className="button button-primary" href={`/scenarios/${role.key}`}>
                상황추천
              </Link>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
