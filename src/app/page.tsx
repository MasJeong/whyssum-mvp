import Link from "next/link";
import { roles, sourceNote } from "@/lib/mvp-data";

export default function Home() {
  return (
    <main className="container page">
      <section className="hero card hero-grid">
        <article>
          <p className="eyebrow">가볍게 시작하는 선택 가이드</p>
          <h1>요즘 다 쓰는 것 말고, 내 상황에 맞는 걸 찾자</h1>
          <p className="muted">
            왜씀?은 직무별 트렌드 수치와 상황별 추천을 같이 보여줘서, 도구를 고를 때 설명 가능한 근거를 만들게 도와줍니다.
          </p>
          <div className="button-row">
            <Link href="/roles" className="button button-primary">
              직무 고르기
            </Link>
            <Link href="/scenarios/backend" className="button button-ghost">
              상황추천 체험
            </Link>
          </div>
        </article>
        <article className="card">
          <p className="eyebrow">3분 플로우</p>
          <h2>빠른 의사결정 루트</h2>
          <ul>
            <li>직무 선택</li>
            <li>상황 조건(팀/기간/우선순위) 확인</li>
            <li>안정형·속도형·확장형 중 선택</li>
          </ul>
        </article>
      </section>

      <section className="grid grid-3">
        {roles.map((role) => (
          <article key={role.key} className="card">
            <h2>{role.name}</h2>
            <p className="muted">{role.oneLiner}</p>
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

      <section className="card split-note">
        <div>
          <p className="eyebrow">데이터 안내</p>
          <p className="muted">{sourceNote}</p>
        </div>
        <Link href="/insights" className="button button-ghost">
          이번 달 인사이트 보기
        </Link>
      </section>
    </main>
  );
}
