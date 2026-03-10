"use client";

import { useEffect } from "react";
import { trackGrowthEvent } from "@/lib/growth-events";

type PageVisitTrackerProps = {
  page: string;
  meta?: Record<string, string | number | boolean | null | undefined>;
};

/**
 * 페이지 진입 시 1회 page_view 이벤트를 기록한다.
 * @param page 페이지 키
 * @param meta 추가 메타데이터
 * @returns 렌더링 없는 추적 컴포넌트
 */
export default function PageVisitTracker({ page, meta }: PageVisitTrackerProps) {
  useEffect(() => {
    void trackGrowthEvent({ name: "page_view", page, meta });
  }, [meta, page]);

  return null;
}
