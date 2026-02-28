import Link from "next/link";
import { roles, sourceNote } from "@/lib/mvp-data";

const heroTags = ["빠른 출시", "운영 안정성", "협업 효율", "비용 최적화"];

const trustHighlights = [
  "출처·모드·갱신 시각을 함께 표시합니다.",
  "추천은 조건 변경 시 즉시 다시 계산됩니다.",
  "관심리스트 저장은 내 브라우저에만 보관됩니다.",
];

const faqItems = [
  {
    q: "데이터는 어디서 오나요?",
    a: "공개 리포트 구조를 기준으로 만든 MVP 샘플 데이터입니다. 이후 공식 API/리포트 수집 파이프라인으로 교체합니다.",
  },
  {
    q: "추천은 자동으로 계산되나요?",
    a: "네. 상황추천 화면에서 팀 규모/일정/우선순위를 고르면 API를 통해 추천안을 다시 계산해 보여줍니다.",
  },
  {
    q: "무료로 계속 사용할 수 있나요?",
    a: "현재 MVP는 전체 기능을 무료로 열어두고 있으며, 추후 고급 리포트가 생겨도 기본 기능은 유지할 계획입니다.",
  },
];

/**
 * 메인 랜딩 페이지를 렌더링한다.
 * @returns 홈 화면 UI
 */
export default function Home() {
  return (
    <main className="container page">
      <section className="hero card hero-grid">
        <article>
          <p className="eyebrow">의사결정 중심 탐색 플랫폼</p>
          <h1>팀 도구 선택을 데이터 근거로 3분 안에 정리하세요</h1>
          <p className="muted readable">
            직무별 트렌드, 상황추천, 비교를 한 흐름으로 연결해 회의 전에 바로 공유 가능한 선택 근거를 만듭니다.
          </p>
          <div className="button-row">
            <Link href="/roles" className="button button-primary">
              <span className="button-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="8" r="2.5" />
                  <path d="M4.5 17c.7-2.1 2.4-3.2 4.5-3.2s3.8 1.1 4.5 3.2" />
                  <circle cx="16.8" cy="9" r="1.8" />
                </svg>
              </span>
              1분 시작하기
            </Link>
            <Link href="/scenarios/backend" className="button button-ghost">
              <span className="button-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 4.5l1.9 3.8 4.2.6-3 2.9.7 4.2L12 14l-3.8 2 .7-4.2-3-2.9 4.2-.6L12 4.5z" />
                </svg>
              </span>
              바로 추천 받기
            </Link>
          </div>
          <div className="chip-row mt-md">
            {heroTags.map((tag) => (
              <span key={tag} className="chip">
                {tag}
              </span>
            ))}
          </div>
        </article>
        <article className="card">
          <p className="eyebrow">3분 플로우</p>
          <h2>실사용 루트</h2>
          <ul>
            <li>직무를 선택하고 핵심 지표를 빠르게 스캔</li>
            <li>상황추천에서 내 팀 조건으로 결과 재계산</li>
            <li>비교 화면에서 후보를 2~4개로 압축</li>
          </ul>
          <Link href="/compare" className="text-link">
            비교 페이지 보기
          </Link>
        </article>
      </section>

      <section className="card">
        <p className="eyebrow">빠른 진입</p>
        <h2>어떤 직무 관점에서 볼까?</h2>
        <p className="muted readable">직무별 핵심 의사결정 요소가 다르기 때문에 먼저 관점을 선택하면 탐색 속도가 빨라집니다.</p>
        <div className="grid grid-3 mt-md">
          {roles.map((role) => (
            <article key={role.key} className="card">
              <h3>{role.name}</h3>
              <p className="muted">{role.oneLiner}</p>
              <div className="chip-row">
                {role.strengths.map((tag) => (
                  <span className="chip" key={tag}>
                    {tag}
                  </span>
                ))}
              </div>
              <div className="button-row">
                <Link href={`/trends/${role.key}`} className="button button-ghost">
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
                <Link href={`/scenarios/${role.key}`} className="button button-primary">
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
        </div>
      </section>

      <section className="grid grid-2">
        <article className="card">
          <p className="eyebrow">운영 신뢰 요소</p>
          <h2>데이터 투명성</h2>
          <p className="muted readable">지표는 출처/표본/업데이트 시점을 함께 표기하고, 추천 결과는 조건 변경 시 다시 계산합니다.</p>
          <ul className="mt-sm">
            {trustHighlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="muted mt-sm">
            {sourceNote}
          </p>
        </article>
        <article className="card">
          <p className="eyebrow">업데이트</p>
          <h2>월간 인사이트 구독</h2>
          <p className="muted readable">핵심 변화만 모은 인사이트 페이지를 먼저 보고, 필요하면 트렌드/비교로 내려가세요.</p>
          <div className="button-row">
            <Link href="/insights" className="button button-primary">
              <span className="button-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 4.8a5.5 5.5 0 0 0-3.3 9.9c.7.5 1.3 1.4 1.3 2.3h4c0-.9.6-1.8 1.3-2.3A5.5 5.5 0 0 0 12 4.8z" />
                  <path d="M10.2 19h3.6" />
                </svg>
              </span>
              인사이트 보기
            </Link>
            <Link href="/trends/backend" className="button button-ghost">
              <span className="button-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19h16" />
                  <path d="M7 16V9" />
                  <path d="M12 16V6" />
                  <path d="M17 16v-4" />
                </svg>
              </span>
              트렌드 보기
            </Link>
          </div>
        </article>
      </section>

      <section className="card">
        <p className="eyebrow">FAQ</p>
        <h2>자주 묻는 질문</h2>
        <div className="faq-list">
          {faqItems.map((item) => (
            <article key={item.q} className="faq-item">
              <h3>{item.q}</h3>
              <p className="muted">{item.a}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
