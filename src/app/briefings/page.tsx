import BriefingBoard from "@/components/briefing-board";

/**
 * 트렌드 브리핑 페이지를 렌더링한다.
 * @returns 브리핑 페이지 UI
 */
export default function BriefingsPage() {
  return (
    <main className="container page">
      <section className="card">
        <p className="eyebrow">트렌드 브리핑</p>
        <h1>최근 동향과 해석을 함께 확인</h1>
        <p className="muted">
          지표 변화의 배경을 빠르게 파악할 수 있도록 직무별 주요 기사와 업데이트를 요약해 제공합니다.
        </p>
      </section>
      <BriefingBoard />
    </main>
  );
}
