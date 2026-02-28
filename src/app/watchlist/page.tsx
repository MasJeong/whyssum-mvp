import WatchlistView from "@/components/watchlist-view";

/**
 * 저장한 관심 도구 목록 페이지를 렌더링한다.
 * @returns 관심리스트 페이지 UI
 */
export default function WatchlistPage() {
  return (
    <main className="container page">
      <section className="card">
        <p className="eyebrow">관심리스트</p>
        <h1>저장한 도구 모아보기</h1>
        <p className="muted">트렌드/비교 화면에서 관심으로 저장한 항목을 모아 확인할 수 있습니다.</p>
      </section>
      <WatchlistView />
    </main>
  );
}
