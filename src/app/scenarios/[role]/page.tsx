import Link from "next/link";
import { notFound } from "next/navigation";
import ScenarioExplorer from "@/components/scenario-explorer";
import { roles, scenarios, type RoleKey } from "@/lib/mvp-data";

/** 상황추천 페이지 컴포넌트 props (Next.js 15+ params/searchParams는 Promise) */
type PageProps = {
  params: Promise<{ role: string }>;
  searchParams: Promise<{ teamSize?: string; timeline?: string; priority?: string }>;
};

/**
 * 직무별 상황추천 페이지를 렌더링한다.
 * @param params 동적 라우트 파라미터
 * @param searchParams 필터 초기값 쿼리 파라미터
 * @returns 상황추천 페이지 UI
 */
export default async function ScenarioPage({ params, searchParams }: PageProps) {
  const { role } = await params;
  const query = await searchParams;
  const roleKey = role as RoleKey;
  const roleInfo = roles.find((item) => item.key === roleKey);

  if (!roleInfo) {
    notFound();
  }

  const roleScenarios = scenarios.filter((item) => item.role === roleKey);
  return (
    <main className="container page">
      <section className="card">
        <p className="eyebrow">상황추천</p>
        <h1>{roleInfo.name}</h1>
        <p className="muted readable">같은 직무라도 팀 크기와 일정, 우선순위에 따라 추천안이 달라집니다.</p>
        <div className="role-switch mt-md">
          {roles.map((item) => (
            <Link
              key={item.key}
              href={`/scenarios/${item.key}`}
              className={`role-pill ${item.key === roleKey ? "role-pill-active" : ""}`}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="card">
        <h2>자주 찾는 상황</h2>
        <div className="chip-row">
          {roleScenarios.map((item) => (
            <Link
              className="chip"
              key={item.id}
              href={`/scenarios/${roleKey}?teamSize=${encodeURIComponent(item.teamSize)}&timeline=${encodeURIComponent(item.timeline)}&priority=${encodeURIComponent(item.priority)}`}
            >
              {item.teamSize} · {item.timeline} · {item.priority}
            </Link>
          ))}
        </div>
      </section>

      <ScenarioExplorer
        role={roleKey}
        initialSelection={{
          teamSize: query.teamSize,
          timeline: query.timeline,
          priority: query.priority,
        }}
      />

      <section className="card split-note">
        <div>
          <h2>선택이 애매하면?</h2>
          <p className="muted readable">비교 화면에서 러닝커브, 운영복잡도, 비용 부담을 한 번에 보세요.</p>
        </div>
        <Link href="/compare" className="button button-primary">
          <span className="button-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="5" y="6" width="5" height="12" rx="1.2" />
              <rect x="14" y="6" width="5" height="12" rx="1.2" />
            </svg>
          </span>
          추천안 비교하기
        </Link>
      </section>
    </main>
  );
}
