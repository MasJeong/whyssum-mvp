import Link from "next/link";
import { roles, sourceNote } from "@/lib/mvp-data";

export default function Home() {
  return (
    <main className="container">
      <section className="hero card">
        <p className="eyebrow">가벼운 의사결정 플랫폼</p>
        <h1>왜씀?</h1>
        <p>
          직무별로 요즘 쓰는 도구와 기술을 보고, 지금 내 상황에 맞는 선택지를 바로 확인하세요.
        </p>
        <div className="button-row">
          <Link href="/roles" className="button button-primary">
            직무 고르기
          </Link>
          <Link href="/scenarios/backend" className="button button-ghost">
            상황추천 바로 보기
          </Link>
        </div>
      </section>

      <section className="grid grid-3">
        {roles.map((role) => (
          <article key={role.key} className="card">
            <h2>{role.name}</h2>
            <p>{role.oneLiner}</p>
            <div className="chip-row">
              {role.strengths.map((tag) => (
                <span className="chip" key={tag}>
                  {tag}
                </span>
              ))}
            </div>
            <Link href={`/trends/${role.key}`} className="text-link">
              트렌드 보기
            </Link>
          </article>
        ))}
      </section>

      <section className="card muted-note">
        <strong>데이터 안내</strong>
        <p>{sourceNote}</p>
      </section>
    </main>
  );
}
