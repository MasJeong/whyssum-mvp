import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AdSlot from "@/components/ad-slot";
import PageReturnBadge from "@/components/page-return-badge";
import PageVisitTracker from "@/components/page-visit-tracker";
import RelatedContentSection from "@/components/related-content-section";
import ScenarioExplorer from "@/components/scenario-explorer";
import TrackedLink from "@/components/tracked-link";
import { roles, scenarios, type RoleKey } from "@/lib/mvp-data";

/** 상황추천 페이지 컴포넌트 props (Next.js 15+ params/searchParams는 Promise) */
type PageProps = {
  params: Promise<{ role: string }>;
  searchParams: Promise<{ teamSize?: string; timeline?: string; priority?: string; snapshot?: string }>;
};

/**
 * 직무별 상황추천 페이지 메타데이터를 생성한다.
 * @param params 동적 라우트 파라미터
 * @returns 메타데이터
 */
export async function generateMetadata({ params }: Pick<PageProps, "params">): Promise<Metadata> {
  const { role } = await params;
  const roleKey = role as RoleKey;
  const roleInfo = roles.find((item) => item.key === roleKey);

  if (!roleInfo) {
    return {
      title: "상황추천",
      description: "조건 기반 상황추천",
    };
  }

  return {
    title: `${roleInfo.name} 상황추천`,
    description: `${roleInfo.name} 팀 규모·일정·우선순위 조건에 맞춰 추천안을 재계산하는 페이지`,
    alternates: {
      canonical: `/scenarios/${roleKey}`,
    },
  };
}

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
      <PageVisitTracker page="scenarios" meta={{ role: roleKey, hasSnapshot: Boolean(query.snapshot) }} />
      <section className="card">
        <p className="eyebrow">상황추천</p>
        <h1>{roleInfo.name}</h1>
        <p className="muted readable">같은 직무라도 팀 크기와 일정, 우선순위에 따라 추천안이 달라집니다.</p>
        <PageReturnBadge page={`scenarios-${roleKey}`} label={`${roleInfo.name} 상황추천`} />
        <div className="role-switch mt-md">
          {roles.map((item) => (
            <TrackedLink
              key={item.key}
              href={`/scenarios/${item.key}`}
              className={`role-pill ${item.key === roleKey ? "role-pill-active" : ""}`}
              eventName="scenario_click"
              eventPage="scenarios"
              eventMeta={{ role: item.key, cta: "role-pill" }}
            >
              {item.name}
            </TrackedLink>
          ))}
        </div>
      </section>

      <AdSlot slotId={`scenarios-inline-${roleKey}`} variant="inline" label="스폰서 사례" />

      <section className="card">
        <h2>자주 찾는 상황</h2>
        <div className="chip-row">
          {roleScenarios.map((item) => (
            <TrackedLink
              className="chip"
              key={item.id}
              href={`/scenarios/${roleKey}?teamSize=${encodeURIComponent(item.teamSize)}&timeline=${encodeURIComponent(item.timeline)}&priority=${encodeURIComponent(item.priority)}`}
              eventName="scenario_click"
              eventPage="scenarios"
              eventMeta={{ role: roleKey, cta: "preset-chip", priority: item.priority }}
            >
              {item.teamSize} · {item.timeline} · {item.priority}
            </TrackedLink>
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
        initialSnapshotId={query.snapshot}
      />

      <section className="card split-note">
        <div>
          <h2>선택이 애매하면?</h2>
          <p className="muted readable">비교 화면에서 러닝커브, 운영복잡도, 비용 부담을 한 번에 보세요.</p>
        </div>
        <TrackedLink href="/compare" className="button button-primary" eventName="compare_select" eventPage="scenarios" eventMeta={{ role: roleKey, cta: "fallback-compare" }}>
          <span className="button-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="5" y="6" width="5" height="12" rx="1.2" />
              <rect x="14" y="6" width="5" height="12" rx="1.2" />
            </svg>
          </span>
          추천안 비교하기
        </TrackedLink>
      </section>

      <RelatedContentSection context={{ page: "scenarios", role: roleKey }} />
    </main>
  );
}
