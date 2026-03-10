import type { Metadata } from "next";
import AdSlot from "@/components/ad-slot";
import BriefingReturnBadge from "@/components/briefing-return-badge";
import BriefingBoard from "@/components/briefing-board";
import PageVisitTracker from "@/components/page-visit-tracker";
import RelatedContentSection from "@/components/related-content-section";

export const metadata: Metadata = {
  title: "트렌드 브리핑",
  description: "직무별 업데이트와 핵심 해석을 빠르게 읽는 브리핑 페이지",
  alternates: {
    canonical: "/briefings",
  },
};

/**
 * 트렌드 브리핑 페이지를 렌더링한다.
 * @returns 브리핑 페이지 UI
 */
export default function BriefingsPage() {
  return (
    <main className="container page">
      <PageVisitTracker page="briefings" />
      <section className="card">
        <p className="eyebrow">트렌드 브리핑</p>
        <h1>최근 동향과 해석을 함께 확인</h1>
        <p className="muted">
          지표 변화의 배경을 빠르게 파악할 수 있도록 직무별 주요 기사와 업데이트를 요약해 제공합니다.
        </p>
        <div className="button-row mt-sm">
          <a href="/feed.xml" className="button button-ghost" target="_blank" rel="noreferrer">
            RSS 구독
          </a>
        </div>
        <BriefingReturnBadge />
      </section>

      <AdSlot slotId="briefings-inline-1" variant="inline" label="스폰서 동향" />

      <BriefingBoard />

      <RelatedContentSection context={{ page: "briefings" }} />
    </main>
  );
}
