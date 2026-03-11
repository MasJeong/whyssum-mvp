"use client";

import { useEffect, useState } from "react";
import { trackGrowthEvent } from "@/lib/growth-events";

type PageReturnBadgeProps = {
  page: string;
  label: string;
};

/**
 * 마지막 방문 시각을 현재 문맥용 localStorage 키로 변환한다.
 * @param page 페이지 식별자
 * @returns 저장소 키
 */
function getVisitStorageKey(page: string) {
  return `whyssum:return-visit:${page}`;
}

/**
 * 경과 시간을 분/시간/일 단위의 짧은 한국어 문구로 변환한다.
 * @param elapsedMs 마지막 방문 이후 경과 시간
 * @returns 사용자 표시용 경과 문구
 */
function formatElapsedLabel(elapsedMs: number) {
  const elapsedMinutes = Math.max(1, Math.round(elapsedMs / (60 * 1000)));
  if (elapsedMinutes < 60) return `${elapsedMinutes}분`;

  const elapsedHours = Math.round(elapsedMinutes / 60);
  if (elapsedHours < 24) return `${elapsedHours}시간`;

  return `${Math.round(elapsedHours / 24)}일`;
}

/**
 * 주요 페이지 재방문 시 마지막 방문 이후 경과 시간을 알려주는 배지다.
 * @param page 페이지 식별자
 * @param label 화면 표시용 페이지 이름
 * @returns 재방문 배지 또는 null
 */
export default function PageReturnBadge({ page, label }: PageReturnBadgeProps) {
  const storageKey = getVisitStorageKey(page);
  const [{ elapsedMs, lastVisit }] = useState<{ lastVisit: number | null; elapsedMs: number | null }>(() => {
    if (typeof window === "undefined") {
      return { lastVisit: null, elapsedMs: null };
    }
    const raw = window.localStorage.getItem(storageKey);
    const parsed = raw ? Number(raw) : NaN;
    const restoredLastVisit = Number.isFinite(parsed) ? parsed : null;
    return {
      lastVisit: restoredLastVisit,
      elapsedMs: restoredLastVisit ? Math.max(0, Date.now() - restoredLastVisit) : null,
    };
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(storageKey, String(Date.now()));
  }, [storageKey]);

  useEffect(() => {
    if (!elapsedMs) return;
    void trackGrowthEvent({
      name: "revisit_widget_view",
      page,
      meta: {
        surface: "page-return-badge",
        label,
        elapsedMinutes: Math.max(1, Math.round(elapsedMs / (60 * 1000))),
      },
    });
  }, [elapsedMs, label, page]);

  if (!elapsedMs) {
    return null;
  }

  return <p className="inline-note">지난 방문 이후 {formatElapsedLabel(elapsedMs)} 만에 {label} 화면을 다시 보고 있습니다.</p>;
}
