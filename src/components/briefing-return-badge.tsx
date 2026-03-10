"use client";

import { useEffect, useMemo, useState } from "react";
import { briefingItems } from "@/lib/briefing-data";
import { trackGrowthEvent } from "@/lib/growth-events";

const VISIT_KEY = "whyssum:briefings-last-visit";

/**
 * 브리핑 재방문 시 신규 항목 개수를 보여주는 배지다.
 * @returns 신규 브리핑 안내 UI
 */
export default function BriefingReturnBadge() {
  const [lastVisit] = useState<number | null>(() => {
    if (typeof window === "undefined") return null;
    const raw = window.localStorage.getItem(VISIT_KEY);
    const parsed = raw ? Number(raw) : NaN;
    return Number.isFinite(parsed) ? parsed : null;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(VISIT_KEY, String(Date.now()));
  }, []);

  const newCount = useMemo(() => {
    if (!lastVisit) return 0;
    return briefingItems.filter((item) => new Date(item.publishedAt).getTime() > lastVisit).length;
  }, [lastVisit]);

  useEffect(() => {
    if (!lastVisit || newCount <= 0) return;
    void trackGrowthEvent({ name: "revisit_widget_view", page: "briefings", meta: { newCount } });
  }, [lastVisit, newCount]);

  if (!lastVisit || newCount <= 0) {
    return null;
  }

  return <p className="inline-note">지난 방문 이후 새 브리핑 {newCount}건이 추가되었습니다.</p>;
}
