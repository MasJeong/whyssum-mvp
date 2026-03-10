import TrackedLink from "@/components/tracked-link";
import { getRelatedContentLinks, type RelatedContentContext } from "@/lib/related-content";

type RelatedContentSectionProps = {
  context: RelatedContentContext;
};

/**
 * 다음 탐색 행동을 유도하는 관련 콘텐츠 섹션을 렌더링한다.
 * @param context 현재 페이지 컨텍스트
 * @returns 관련 콘텐츠 섹션 UI
 */
export default function RelatedContentSection({ context }: RelatedContentSectionProps) {
  const items = getRelatedContentLinks(context);

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="card">
      <p className="eyebrow">다음으로 보기</p>
      <h2>여기서 끝내지 말고 이어서 보세요</h2>
      <div className="grid grid-3 mt-sm">
        {items.map((item) => (
          <article key={item.href} className="card">
            <p className="list-title">{item.title}</p>
            <p className="muted readable">{item.description}</p>
            <p className="inline-note mt-xs">추천 이유: {item.reason}</p>
            <TrackedLink
              href={item.href}
              className="text-link"
              eventName="related_content_click"
              eventPage={context.page}
              eventMeta={{ target: item.href, reason: item.reason }}
            >
              이동하기
            </TrackedLink>
          </article>
        ))}
      </div>
    </section>
  );
}
