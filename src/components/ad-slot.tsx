"use client";

import { useEffect, useRef, useState } from "react";
import { getAdExperimentConfig, resolveAdExperimentVariant } from "@/lib/ad-experiments";
import { getOrCreateGrowthVisitorId, trackGrowthEvent } from "@/lib/growth-events";

type AdSlotVariant = "inline" | "sidebar";

type AdSlotProps = {
  slotId: string;
  variant?: AdSlotVariant;
  label?: string;
};

/**
 * 광고 슬롯을 CLS 없이 지연 노출하는 컴포넌트다.
 * @param slotId 광고 슬롯 식별자
 * @param variant 슬롯 크기 변형
 * @param label 안내 문구
 * @returns 광고 슬롯 UI
 */
export default function AdSlot({ slotId, variant = "inline", label = "스폰서 콘텐츠" }: AdSlotProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const loggedImpressionRef = useRef(false);
  const [visible, setVisible] = useState(false);
  const experiment = getAdExperimentConfig(slotId);
  const experimentVariant = resolveAdExperimentVariant(slotId, getOrCreateGrowthVisitorId());

  useEffect(() => {
    if (!hostRef.current || visible) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "180px" },
    );

    observer.observe(hostRef.current);
    return () => observer.disconnect();
  }, [visible]);

  useEffect(() => {
    if (!visible || loggedImpressionRef.current) return;
    loggedImpressionRef.current = true;
    void trackGrowthEvent({
      name: "ad_impression",
      page: "ad-slot",
      meta: { slotId, variant: experimentVariant, experimentId: experiment.experimentId },
    });
  }, [experiment.experimentId, experimentVariant, slotId, visible]);

  const headline = experimentVariant === "value" ? "실무 검증 사례 모음" : "도구 선택 가이드 스폰서";
  const description =
    experimentVariant === "value"
      ? "팀이 실제로 선택한 기준과 운영 포인트를 요약해 보세요."
      : "성과를 해치지 않는 도구 운영 사례를 확인해 보세요.";

  return (
    <aside className={`ad-slot ad-slot-${variant}`} aria-label={`${label} 영역`} ref={hostRef}>
      <p className="ad-slot-label">{label}</p>
      <div className="ad-slot-body">
        {visible ? (
          <div className="ad-slot-house">
            <strong>{headline}</strong>
            <p>{description}</p>
            <a
              href={`/advertising?slot=${encodeURIComponent(slotId)}&variant=${encodeURIComponent(experimentVariant)}`}
              className="text-link"
              onClick={() => {
                void trackGrowthEvent({
                  name: "ad_click",
                  page: "ad-slot",
                  meta: { slotId, variant: experimentVariant, experimentId: experiment.experimentId },
                });
              }}
            >
              자세히 보기
            </a>
          </div>
        ) : (
          <div className="ad-slot-placeholder" aria-hidden="true" />
        )}
      </div>
    </aside>
  );
}
