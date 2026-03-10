import type { Metadata } from "next";
import AdSlot from "@/components/ad-slot";
import CompareInteractive from "@/components/compare-interactive";
import PageVisitTracker from "@/components/page-visit-tracker";
import RelatedContentSection from "@/components/related-content-section";
import { trendData } from "@/lib/mvp-data";

export const metadata: Metadata = {
  title: "도구 비교",
  description: "직무별 후보를 선택해 채택률·성장률·안정성을 비교하는 페이지",
  alternates: {
    canonical: "/compare",
  },
};

/**
 * 도구 비교 페이지를 렌더링한다.
 * @returns 비교 페이지 UI
 */
type ComparePageProps = {
  searchParams: Promise<{ snapshot?: string }>;
};

export default async function ComparePage({ searchParams }: ComparePageProps) {
  const query = await searchParams;
  const backendAvg = Math.round(
    trendData.backend.reduce((sum, row) => sum + row.demandIndex, 0) / trendData.backend.length,
  );

  return (
    <main className="container page">
      <PageVisitTracker page="compare" meta={{ hasSnapshot: Boolean(query.snapshot) }} />
      <section className="card">
        <p className="eyebrow">비교</p>
        <h1>같은 상황에서 무엇이 더 맞는지 비교</h1>
        <p className="muted readable">직무를 바꿔가며 기술/도구 후보를 직접 선택해 비교할 수 있습니다.</p>
      </section>

      <CompareInteractive initialSnapshotId={query.snapshot} />

      <AdSlot slotId="compare-inline-1" variant="inline" label="스폰서 비교 리포트" />

      <section className="grid grid-2">
        <article className="card">
          <h2>빠른 출시 우선</h2>
          <p className="muted readable">NestJS/Node 계열이 개발 속도와 팀 온보딩에서 유리합니다.</p>
        </article>
        <article className="card">
          <h2>확장성 우선</h2>
          <p className="muted readable">
            Go/Spring 계열이 장기 확장성에서 강점을 보입니다. 백엔드 평균 수요지수는 {backendAvg}점입니다.
          </p>
        </article>
      </section>

      <RelatedContentSection context={{ page: "compare" }} />
    </main>
  );
}
