import Link from "next/link";
import { roles, sourceNote } from "@/lib/mvp-data";

const heroTags = ["빠른 출시", "운영 안정성", "협업 효율", "비용 최적화"];

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
          <h1>요즘 뭐 쓰는지보다, 왜 쓰는지를 보여주는 곳</h1>
          <p className="muted readable">
            직무별 트렌드 수치와 상황추천을 한 화면에서 연결해 도구 선택 근거를 빠르게 만들 수 있도록 구성했습니다.
          </p>
          <div className="button-row">
            <Link href="/roles" className="button button-primary">
              직무별 시작하기
            </Link>
            <Link href="/scenarios/backend" className="button button-ghost">
              상황추천 바로 체험
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
                  트렌드
                </Link>
                <Link href={`/scenarios/${role.key}`} className="button button-primary">
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
              인사이트 보기
            </Link>
            <Link href="/trends/backend" className="button button-ghost">
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
