import Link from "next/link";

/**
 * 광고/스폰서십 운영 원칙 안내 페이지를 렌더링한다.
 * @returns 광고 안내 페이지 UI
 */
export default function AdvertisingPage() {
  return (
    <main className="container page">
      <section className="card">
        <p className="eyebrow">Advertising</p>
        <h1>광고 및 스폰서십 안내</h1>
        <p className="muted readable">
          왜씀은 무료 서비스로 운영되며, 광고와 스폰서십으로 운영비를 충당합니다. 사용자 신뢰를 해치지 않도록 명확한 표기와
          콘텐츠 분리를 원칙으로 합니다.
        </p>
      </section>

      <section className="grid grid-2">
        <article className="card">
          <h2>운영 원칙</h2>
          <ul>
            <li>광고 영역은 본문과 시각적으로 구분해 표시합니다.</li>
            <li>추천/비교 점수 계산 로직은 광고에 의해 변경되지 않습니다.</li>
            <li>과도한 팝업, 자동 재생, 콘텐츠 가림형 광고는 사용하지 않습니다.</li>
          </ul>
        </article>
        <article className="card">
          <h2>협업 문의</h2>
          <p className="muted readable">스폰서십/파트너십 문의는 아래 경로로 접수할 수 있습니다.</p>
          <p className="mt-sm">
            <a className="text-link" href="mailto:partnership@whyssum.example">
              partnership@whyssum.example
            </a>
          </p>
          <p className="inline-note mt-sm">실제 운영 시 메일 주소를 서비스 도메인으로 교체하세요.</p>
        </article>
      </section>

      <section className="card split-note">
        <div>
          <h2>데이터 신뢰와 함께 보세요</h2>
          <p className="muted readable">광고 표기 정책과 데이터 해석 가이드를 함께 확인하면 의사결정 신뢰도를 높일 수 있습니다.</p>
        </div>
        <Link href="/insights" className="button button-primary">
          인사이트 보기
        </Link>
      </section>
    </main>
  );
}
