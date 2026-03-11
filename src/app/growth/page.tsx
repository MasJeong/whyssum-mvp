import type { Metadata } from "next";
import Link from "next/link";
import PageReturnBadge from "@/components/page-return-badge";
import PageVisitTracker from "@/components/page-visit-tracker";
import { getGrowthKpiReport } from "@/lib/growth-store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "성장 KPI 대시보드",
  description: "D1/D7/D30 기준으로 활성화, 공유, 재방문, 광고 CTR을 확인하는 운영 대시보드",
  alternates: {
    canonical: "/growth",
  },
};

const growthWindows = ["d1", "d7", "d30"] as const;

/**
 * KPI 비율 값을 퍼센트 문자열로 변환한다.
 * @param value 원본 비율 값
 * @returns 사용자 표시용 퍼센트 문자열
 */
function formatRate(value: number) {
  return `${value.toFixed(1)}%`;
}

/**
 * KPI 윈도우 키를 사용자 친화적인 라벨로 변환한다.
 * @param window KPI 윈도우
 * @returns 화면 표시 라벨
 */
function formatWindowLabel(window: (typeof growthWindows)[number]) {
  if (window === "d1") return "D1";
  if (window === "d7") return "D7";
  return "D30";
}

/**
 * 이벤트 키를 대시보드에서 읽기 쉬운 라벨로 변환한다.
 * @param name 이벤트 이름
 * @returns 화면 표시 라벨
 */
function formatEventLabel(name: string) {
  return name.replaceAll("_", " ");
}

/**
 * 성장 KPI 요약 페이지를 렌더링한다.
 * @returns 성장 대시보드 UI
 */
export default function GrowthPage() {
  const reports = growthWindows.map((window) => getGrowthKpiReport(window));

  return (
    <main className="container page">
      <PageVisitTracker page="growth" />
      <section className="card">
        <p className="eyebrow">성장 대시보드</p>
        <h1>D1 / D7 / D30 핵심 지표</h1>
        <p className="muted readable">유입 이후 활성화, 공유, 재방문, 광고 클릭 흐름을 최근 윈도우별로 빠르게 점검할 수 있습니다.</p>
        <PageReturnBadge page="growth" label="성장 KPI" />
        <div className="button-row mt-sm">
          <Link href="/briefings" className="button button-ghost">
            브리핑 점검
          </Link>
          <Link href="/scenarios/backend" className="button button-primary">
            상황추천 확인
          </Link>
        </div>
      </section>

      <section className="grid grid-3">
        {reports.map((report) => (
          <article key={report.window} className="card">
            <p className="eyebrow">{formatWindowLabel(report.window)}</p>
            <h2>세션 {report.sessionCount} / 방문자 {report.visitorCount}</h2>
            <div className="grid grid-2 mt-sm">
              <div>
                <p className="list-title">활성화율</p>
                <strong>{formatRate(report.activationRate)}</strong>
              </div>
              <div>
                <p className="list-title">공유율</p>
                <strong>{formatRate(report.shareRate)}</strong>
              </div>
              <div>
                <p className="list-title">재방문율</p>
                <strong>{formatRate(report.revisitRate)}</strong>
              </div>
              <div>
                <p className="list-title">광고 CTR</p>
                <strong>{formatRate(report.adClickThroughRate)}</strong>
              </div>
            </div>
            <p className="inline-note mt-sm">뉴스레터 구독 전환율 {formatRate(report.newsletterSubscribeRate)}</p>
          </article>
        ))}
      </section>

      <section className="grid grid-3">
        {reports.map((report) => (
          <article key={`${report.window}-events`} className="card">
            <p className="eyebrow">{formatWindowLabel(report.window)} 상위 이벤트</p>
            <h2>이벤트 분포</h2>
            <ul>
              {report.topEvents.length > 0 ? (
                report.topEvents.map((event) => <li key={`${report.window}-${event.name}`}>{formatEventLabel(event.name)} - {event.count}회</li>)
              ) : (
                <li>아직 수집된 이벤트가 없습니다.</li>
              )}
            </ul>
          </article>
        ))}
      </section>

      <section className="card split-note">
        <div>
          <h2>운영 메모</h2>
          <p className="muted readable">현재 KPI는 서버 메모리 저장소 기준이라 서버 재시작 시 누적 이벤트가 초기화됩니다. 운영 전 영속 저장소 연결이 필요합니다.</p>
        </div>
        <a href="/api/growth-kpis?window=d7" className="button button-ghost" target="_blank" rel="noreferrer">
          D7 API 응답 보기
        </a>
      </section>
    </main>
  );
}
