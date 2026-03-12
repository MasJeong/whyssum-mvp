"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { trackGrowthEvent } from "@/lib/growth-events";
import type { BriefingItem } from "@/lib/briefing-data";

/** /api/briefings 응답 JSON 형태 */
type ApiResponse = {
  items: BriefingItem[];
  count: number;
  fetchedAt: string;
  filters?: {
    role: string;
    impact: string;
    periodDays: number;
    sortBy: "priority" | "publishedAt";
  };
  summary?: {
    highImpactCount: number;
    recentCount7d: number;
    recommendedRole: string;
  };
  error?: string;
};

type StoredFilters = {
  role: string;
  impact: string;
  periodDays: number;
};

const briefingFilterStorageKey = "whyssum:briefing:lastFilters";

const roleOptions = [
  { value: "all", label: "전체" },
  { value: "backend", label: "백엔드" },
  { value: "designer", label: "디자이너" },
  { value: "pm", label: "PM" },
];

const impactOptions = [
  { value: "all", label: "전체 영향도" },
  { value: "high", label: "영향 큼" },
  { value: "medium", label: "영향 보통" },
  { value: "low", label: "영향 낮음" },
];

const periodOptions = [
  { value: 7, label: "최근 7일" },
  { value: 30, label: "최근 30일" },
  { value: 90, label: "최근 90일" },
];

const routeByRole: Record<string, string> = {
  backend: "/scenarios/backend",
  designer: "/scenarios/designer",
  pm: "/scenarios/pm",
  all: "/scenarios/backend",
};

/**
 * 영향도 코드를 사용자 친화 라벨로 변환한다.
 * @param impact 영향도 코드
 * @returns 한글 영향도 라벨
 */
function getImpactLabel(impact: BriefingItem["impact"]) {
  if (impact === "high") return "높음";
  if (impact === "medium") return "보통";
  return "낮음";
}

/**
 * 직무 코드를 화면 표시용 라벨로 변환한다.
 * @param value 직무 코드
 * @returns 한글 직무 라벨
 */
function getRoleLabel(value?: string) {
  if (!value) return "전체";
  return roleOptions.find((option) => option.value === value)?.label ?? "전체";
}

/**
 * 브리핑 행동 이벤트를 성장 이벤트 파이프라인으로 기록한다.
 * @param name 이벤트 이름
 * @param meta 부가 정보
 * @returns 없음
 */
function logBriefingEvent(
  name: "briefing_view" | "briefing_filter_change" | "briefing_card_action_click" | "briefing_empty_state_recover",
  meta: Record<string, string | number | boolean | null>,
) {
  void trackGrowthEvent({
    name,
    page: "briefings",
    meta,
  });
}

/**
 * 브리핑 목록을 필터 조건으로 조회하고 카드 형태로 보여준다.
 * @returns 브리핑 보드 UI
 */
export default function BriefingBoard() {
  const [role, setRole] = useState("all");
  const [impact, setImpact] = useState("all");
  const [periodDays, setPeriodDays] = useState(30);
  const [items, setItems] = useState<BriefingItem[]>([]);
  const [fetchedAt, setFetchedAt] = useState<string>("");
  const [summary, setSummary] = useState<ApiResponse["summary"]>();
  const [sortByLabel, setSortByLabel] = useState("영향도 우선");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(briefingFilterStorageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as StoredFilters;
      if (typeof parsed.role === "string") setRole(parsed.role);
      if (typeof parsed.impact === "string") setImpact(parsed.impact);
      if (typeof parsed.periodDays === "number") setPeriodDays(parsed.periodDays);
    } catch {
      return;
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        localStorage.setItem(briefingFilterStorageKey, JSON.stringify({ role, impact, periodDays }));
      } catch {
        return;
      }
    }, 120);

    return () => window.clearTimeout(timer);
  }, [impact, periodDays, role]);

  useEffect(() => {
    let active = true;

    /**
     * 현재 필터 조건으로 브리핑 목록을 조회하고 상태를 갱신한다.
     * @returns 없음
     */
    const fetchItems = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          role,
          impact,
          periodDays: String(periodDays),
          sortBy: "priority",
        });
        const response = await fetch(`/api/briefings?${params.toString()}`, {
          method: "GET",
          headers: { Accept: "application/json" },
          cache: "no-store",
        });

        const payload = (await response.json()) as ApiResponse;

        if (!response.ok) {
          throw new Error(payload.error ?? "브리핑을 불러오지 못했습니다.");
        }

        if (!active) return;
        setItems(payload.items ?? []);
        setFetchedAt(payload.fetchedAt ?? "");
        setSummary(payload.summary);
        setSortByLabel(payload.filters?.sortBy === "publishedAt" ? "최신순" : "영향도 우선");
        logBriefingEvent("briefing_view", { role, impact, periodDays, count: payload.count ?? 0 });
      } catch (fetchError) {
        if (!active) return;
        setError(fetchError instanceof Error ? fetchError.message : "알 수 없는 오류가 발생했습니다.");
        setItems([]);
        setSummary(undefined);
      } finally {
        if (active) setLoading(false);
      }
    };

    void fetchItems();
    return () => {
      active = false;
    };
  }, [impact, periodDays, role]);

  const fetchedLabel = useMemo(() => {
    if (!fetchedAt) return "-";
    return new Date(fetchedAt).toLocaleString("ko-KR");
  }, [fetchedAt]);

  /**
   * 빈 결과 화면에서 추천 필터를 적용한다.
   * @returns 없음
   */
  function applyRecoveryFilters() {
    logBriefingEvent("briefing_empty_state_recover", { role, impact, periodDays });
    setRole("all");
    setImpact("all");
    setPeriodDays(90);
  }

  return (
    <>
      <section className="card">
        <p className="eyebrow">필터</p>
        <div className="filter-grid">
          <label className="field">
            <span>직무</span>
            <select
              value={role}
              onChange={(event) => {
                setRole(event.target.value);
                logBriefingEvent("briefing_filter_change", { filter: "role", value: event.target.value });
              }}
            >
              {roleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>영향도</span>
            <select
              value={impact}
              onChange={(event) => {
                setImpact(event.target.value);
                logBriefingEvent("briefing_filter_change", { filter: "impact", value: event.target.value });
              }}
            >
              {impactOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>기간</span>
            <select
              value={periodDays}
              onChange={(event) => {
                const next = Number(event.target.value);
                setPeriodDays(next);
                logBriefingEvent("briefing_filter_change", { filter: "periodDays", value: next });
              }}
            >
              {periodOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="chip-row mt-sm">
          <span className="chip">중요 이슈 {summary?.highImpactCount ?? 0}건</span>
          <span className="chip">최근 7일 {summary?.recentCount7d ?? 0}건</span>
          <span className="chip">추천 직무: {getRoleLabel(summary?.recommendedRole)}</span>
        </div>
        <p className="inline-note mt-sm">
          {loading ? "업데이트 중..." : `마지막 조회: ${fetchedLabel} · 최근 사용 필터 자동 복원`}
        </p>
        <p className="inline-note mt-xs">요약과 목록은 현재 필터 결과 기준이며, 정렬은 {sortByLabel}입니다.</p>
        {error ? <p className="error-text">{error}</p> : null}
      </section>

      {loading ? (
        <section className="grid grid-2">
          {[1, 2, 3, 4].map((idx) => (
            <article className="card" key={`briefing-skeleton-${idx}`}>
              <div className="skeleton-line skeleton-w-sm" />
              <div className="skeleton-line skeleton-w-lg mt-xs" />
              <div className="skeleton-line skeleton-w-full mt-sm" />
              <div className="skeleton-line skeleton-w-full mt-xs" />
            </article>
          ))}
        </section>
      ) : items.length === 0 ? (
        <section className="card">
          <h2>조건에 맞는 브리핑이 없습니다</h2>
          <p className="muted">필터를 완화하거나 기간을 늘려 다시 확인해보세요.</p>
          <div className="button-row mt-sm">
            <button type="button" className="button button-primary" onClick={applyRecoveryFilters}>
              추천 필터로 다시 보기
            </button>
          </div>
        </section>
      ) : (
        <section className="grid grid-2">
          {items.map((item) => (
            <article className="card" key={item.id}>
              <div className="split-note">
                <p className="eyebrow">{getRoleLabel(item.role)}</p>
                <span className={`trust-badge trust-${item.impact === "high" ? "high" : item.impact === "medium" ? "medium" : "low"}`}>
                  영향도 {getImpactLabel(item.impact)}
                </span>
              </div>
              <h2>{item.title}</h2>
              <p className="muted">{item.summary}</p>
              <div className="chip-row">
                {item.tags.map((tag) => (
                  <span className="chip" key={tag}>
                    {tag}
                  </span>
                ))}
              </div>
              <p className="inline-note mt-xs">
                출처: {item.sourceName} · {new Date(item.publishedAt).toLocaleDateString("ko-KR")}
              </p>
              <p className="muted mt-xs">왜 지금 봐야 하나요? 영향도가 큰 이슈일수록 의사결정 우선 확인이 필요합니다.</p>
              <div className="button-row">
                <Link
                  href={routeByRole[item.role] ?? "/scenarios/backend"}
                  className="button button-primary"
                  onClick={() => logBriefingEvent("briefing_card_action_click", { action: "scenario", id: item.id, role: item.role })}
                >
                  <span className="button-icon" aria-hidden="true">
                    <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 4.5l1.9 3.8 4.2.6-3 2.9.7 4.2L12 14l-3.8 2 .7-4.2-3-2.9 4.2-.6L12 4.5z" />
                    </svg>
                  </span>
                  상황추천
                </Link>
                <Link
                  href={item.role === "all" ? "/trends/backend" : `/trends/${item.role}`}
                  className="button button-ghost"
                  onClick={() => logBriefingEvent("briefing_card_action_click", { action: "trends", id: item.id, role: item.role })}
                >
                  <span className="button-icon" aria-hidden="true">
                    <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 19h16" />
                      <path d="M7 16V9" />
                      <path d="M12 16V6" />
                      <path d="M17 16v-4" />
                    </svg>
                  </span>
                  트렌드
                </Link>
                <Link
                  href="/compare"
                  className="button button-ghost"
                  onClick={() => logBriefingEvent("briefing_card_action_click", { action: "compare", id: item.id, role: item.role })}
                >
                  <span className="button-icon" aria-hidden="true">
                    <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="5" y="6" width="5" height="12" rx="1.2" />
                      <rect x="14" y="6" width="5" height="12" rx="1.2" />
                    </svg>
                  </span>
                  비교
                </Link>
                <a
                  href={item.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="button button-ghost"
                  onClick={() => logBriefingEvent("briefing_card_action_click", { action: "source", id: item.id, role: item.role })}
                >
                  <span className="button-icon" aria-hidden="true">
                    <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 5h5v5" />
                      <path d="M10 14L19 5" />
                      <path d="M19 13v6H5V5h6" />
                    </svg>
                  </span>
                  원문 보기
                </a>
              </div>
            </article>
          ))}
        </section>
      )}
    </>
  );
}
