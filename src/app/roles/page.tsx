import Link from "next/link";
import { roles } from "@/lib/mvp-data";

export default function RolesPage() {
  return (
    <main className="container page">
      <section className="card">
        <p className="eyebrow">직무 허브</p>
        <h1>어떤 직무 관점에서 볼까?</h1>
        <p className="muted">직무마다 중요한 의사결정 기준이 달라서, 같은 도구도 추천 결과가 다르게 나옵니다.</p>
      </section>

      <section className="grid grid-3">
        {roles.map((role) => (
          <article className="card" key={role.key}>
            <h2>{role.name}</h2>
            <p className="muted">{role.oneLiner}</p>
            <div className="chip-row">
              {role.strengths.map((tag) => (
                <span className="chip" key={tag}>
                  {tag}
                </span>
              ))}
            </div>
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

      <section className="card split-note">
        <div>
          <h2>어떻게 보면 좋은가?</h2>
          <p className="muted">트렌드에서 후보를 좁히고, 상황추천에서 최종 선택 근거를 확인하세요.</p>
        </div>
        <Link href="/compare" className="button button-primary">
          비교 화면으로 이동
        </Link>
      </section>
    </main>
  );
}
