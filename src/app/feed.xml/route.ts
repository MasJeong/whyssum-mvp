import { briefingItems } from "@/lib/briefing-data";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/**
 * RSS 항목 XML 문자열을 생성한다.
 * @param itemId 항목 식별자
 * @param title 제목
 * @param description 설명
 * @param pubDate 발행 시각
 * @param link 링크
 * @returns RSS item XML
 */
function buildRssItem(itemId: string, title: string, description: string, pubDate: string, link: string) {
  return `<item><guid>${itemId}</guid><title><![CDATA[${title}]]></title><description><![CDATA[${description}]]></description><link>${link}</link><pubDate>${new Date(pubDate).toUTCString()}</pubDate></item>`;
}

/**
 * 브리핑 RSS 피드를 반환한다.
 * @returns RSS XML 응답
 */
export async function GET() {
  const latest = [...briefingItems].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()).slice(0, 25);

  const itemsXml = latest
    .map((item) => buildRssItem(item.id, item.title, item.summary, item.publishedAt, item.sourceUrl))
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>왜씀 브리핑 피드</title><link>${siteUrl}/briefings</link><description>직무별 트렌드 브리핑 업데이트</description><language>ko-KR</language>${itemsXml}</channel></rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=UTF-8",
      "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
    },
  });
}
