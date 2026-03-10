/**
 * 개인정보 처리 및 데이터 보관 원칙 안내 페이지를 렌더링한다.
 * @returns 개인정보 안내 페이지 UI
 */
export default function PrivacyPage() {
  return (
    <main className="container page">
      <section className="card">
        <p className="eyebrow">Privacy</p>
        <h1>개인정보 및 데이터 처리 안내</h1>
        <p className="muted readable">
          왜씀은 최소 데이터 수집 원칙을 따르며, 의사결정 기능에 필요하지 않은 개인정보는 저장하지 않습니다.
        </p>
      </section>

      <section className="grid grid-2">
        <article className="card">
          <h2>현재 저장되는 데이터</h2>
          <ul>
            <li>관심리스트/최근 선택값: 브라우저 로컬 저장소에만 저장</li>
            <li>구독 이메일: 구독 API 처리 목적 범위에서만 저장(운영 단계에서 영구 저장소 전환 필요)</li>
            <li>API rate limit: 서비스 안정성을 위한 최소 식별 정보(IP 기반)</li>
          </ul>
        </article>
        <article className="card">
          <h2>광고 관련 원칙</h2>
          <ul>
            <li>광고는 명확히 구분된 영역에만 노출</li>
            <li>핵심 데이터/추천 결과와 광고 콘텐츠를 혼합하지 않음</li>
            <li>사용자 경험을 해치는 자동 재생/가림형 광고 미사용</li>
          </ul>
        </article>
      </section>
    </main>
  );
}
