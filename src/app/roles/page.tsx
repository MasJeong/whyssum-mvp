import Link from "next/link";
import { roles } from "@/lib/mvp-data";

/**
 * 직무 선택 허브 페이지를 렌더링한다.
 * @returns 직무 허브 UI
 */
export default function RolesPage() {
  return (
    <main className="container page">
      <section className="card">
        <p className="eyebrow">직무 허브</p>
        <h1>내 직무 기준으로 먼저 후보를 좁히세요</h1>
        <p className="muted readable">직무를 선택하면 바로 트렌드 상위 후보를 보고, 이어서 상황추천으로 최종안을 압축할 수 있습니다.</p>
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
                <span className="button-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 19h16" />
                    <path d="M7 16V9" />
                    <path d="M12 16V6" />
                    <path d="M17 16v-4" />
                  </svg>
                </span>
                트렌드
              </Link>
              <Link className="button button-primary" href={`/scenarios/${role.key}`}>
                <span className="button-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 4.5l1.9 3.8 4.2.6-3 2.9.7 4.2L12 14l-3.8 2 .7-4.2-3-2.9 4.2-.6L12 4.5z" />
                  </svg>
                </span>
                상황추천
              </Link>
            </div>
          </article>
        ))}
      </section>

      <section className="card split-note">
        <div>
          <h2>추천 흐름</h2>
          <p className="muted readable">1) 직무 선택 → 2) 트렌드 상위 확인 → 3) 상황추천에서 팀 조건 반영 → 4) 비교로 최종 결정</p>
        </div>
        <Link href="/compare" className="button button-primary">
          <span className="button-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="5" y="6" width="5" height="12" rx="1.2" />
              <rect x="14" y="6" width="5" height="12" rx="1.2" />
            </svg>
          </span>
          비교 화면으로 이동
        </Link>
      </section>
    </main>
  );
}
