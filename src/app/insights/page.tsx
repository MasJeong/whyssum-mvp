import type { Metadata } from "next";
import AdSlot from "@/components/ad-slot";
import PageVisitTracker from "@/components/page-visit-tracker";
import RelatedContentSection from "@/components/related-content-section";
import TrackedLink from "@/components/tracked-link";
import { insightCards } from "@/lib/mvp-data";

export const metadata: Metadata = {
  title: "월간 인사이트",
  description: "직무별 도구 선택 맥락을 빠르게 파악하는 월간 인사이트 요약",
  alternates: {
    canonical: "/insights",
  },
};

/**
 * 월간 인사이트 요약 페이지를 렌더링한다.
 * @returns 인사이트 페이지 UI
 */
export default function InsightsPage() {
  return (
    <main className="container page">
      <PageVisitTracker page="insights" />
      <section className="card">
        <p className="eyebrow">월간 인사이트</p>
        <h1>요즘 왜 이걸 쓰는지 요약</h1>
        <p className="muted">긴 리포트를 읽기 전에 핵심 변화만 먼저 확인할 수 있도록 가볍게 정리했습니다.</p>
      </section>

      <section className="grid grid-3">
        {insightCards.map((card) => (
          <article key={card.title} className="card">
            <h2>{card.title}</h2>
            <p className="muted">{card.body}</p>
          </article>
        ))}
      </section>

      <AdSlot slotId="insights-inline-1" variant="inline" label="스폰서 인사이트" />

      <section className="card split-note">
        <div>
          <h2>다음 행동으로 이어가기</h2>
          <p className="muted readable">인사이트를 읽었다면 트렌드와 비교로 내려가서 팀 선택안을 바로 압축해 보세요.</p>
        </div>
        <div className="button-row no-margin">
          <TrackedLink href="/trends/backend" className="button button-ghost" eventName="trend_click" eventPage="insights" eventMeta={{ role: "backend" }}>
            트렌드 보기
          </TrackedLink>
          <TrackedLink href="/compare" className="button button-primary" eventName="compare_select" eventPage="insights" eventMeta={{ cta: "insights-next" }}>
            비교하기
          </TrackedLink>
        </div>
      </section>

      <RelatedContentSection context={{ page: "insights" }} />
    </main>
  );
}
