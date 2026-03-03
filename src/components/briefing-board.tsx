"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { BriefingItem } from "@/lib/briefing-data";

/** /api/briefings 응답 JSON 형태 */
type ApiResponse = {
  items: BriefingItem[];
  count: number;
  fetchedAt: string;
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
 * 영향도 텍스트를 정렬 가능한 우선순위 값으로 변환한다.
 * @param impact 영향도
 * @returns 숫자 우선순위(high > medium > low)
 */
function getImpactRank(impact: BriefingItem["impact"]) {
  if (impact === "high") return 3;
  if (impact === "medium") return 2;
  return 1;
}

/**
 * 브리핑 사용 흐름 추적을 위한 경량 이벤트를 기록한다.
 * @param name 이벤트 이름
 * @param payload 부가 정보
 */
function logBriefingEvent(name: string, payload: Record<string, string | number>) {
  if (typeof window === "undefined") return;
  // 1차 단계에서는 콘솔 기반으로 이벤트를 확인하고, 후속 단계에서 서버 전송으로 확장한다.
  console.info(`[briefing-event] ${name}`, payload);
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
      // 저장소 접근 오류 시 기본값으로 동작한다.
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        localStorage.setItem(briefingFilterStorageKey, JSON.stringify({ role, impact, periodDays }));
      } catch {
        // 저장소 접근 오류 시 저장을 건너뛴다.
      }
    }, 150);

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
        const params = new URLSearchParams({ role, impact, periodDays: String(periodDays) });
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
        logBriefingEvent("briefing_view", {
          role,
          impact,
          periodDays,
          count: payload.count ?? 0,
        });
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

  const sortedItems = useMemo(() => {
    return [...items].sort((left, right) => {
      const impactCompared = getImpactRank(right.impact) - getImpactRank(left.impact);
      if (impactCompared !== 0) {
        return impactCompared;
      }
      return new Date(right.publishedAt).getTime() - new Date(left.publishedAt).getTime();
    });
  }, [items]);

  const recommendedRoleLabel = useMemo(() => {
    if (!summary?.recommendedRole) return "전체";
    return roleOptions.find((option) => option.value === summary.recommendedRole)?.label ?? "전체";
  }, [summary?.recommendedRole]);

  /**
   * 빈 결과 화면에서 기본 추천 필터로 복구한다.
   */
  function applyRecoveryFilters() {
    setImpact("all");
    setPeriodDays(90);
    logBriefingEvent("briefing_empty_state_recover", { role, impact, periodDays });
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
                setPeriodDays(Number(event.target.value));
                logBriefingEvent("briefing_filter_change", { filter: "periodDays", value: Number(event.target.value) });
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
          <span className="chip">High 영향도 {summary?.highImpactCount ?? 0}건</span>
          <span className="chip">최근 7일 {summary?.recentCount7d ?? 0}건</span>
          <span className="chip">추천 직무: {recommendedRoleLabel}</span>
        </div>
        <p className="inline-note mt-sm">
          {loading ? "업데이트 중..." : `마지막 조회: ${fetchedLabel} · 최근 사용 필터 자동 복원`}
        </p>
        {error ? <p className="error-text">{error}</p> : null}
      </section>

      {sortedItems.length === 0 ? (
        <section className="card">
          <h2>조건에 맞는 브리핑이 없습니다</h2>
          <p className="muted">필터를 완화하거나 기간을 늘려 다시 확인해보세요.</p>
          <div className="button-row mt-sm">
            <button type="button" className="button button-primary" onClick={applyRecoveryFilters}>
              추천 필터로 다시 보기
            </button>
            <button
              type="button"
              className="button button-ghost"
              onClick={() => {
                setRole("all");
                setImpact("all");
                setPeriodDays(30);
              }}
            >
              기본값으로 초기화
            </button>
          </div>
        </section>
      ) : (
        <section className="grid grid-2">
          {sortedItems.map((item) => (
            <article className="card" key={item.id}>
              <div className="split-note">
                <p className="eyebrow">{item.role.toUpperCase()}</p>
                <span className={`trust-badge trust-${item.impact === "high" ? "high" : item.impact === "medium" ? "medium" : "low"}`}>
                  영향도 {item.impact}
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
              <p className="muted mt-xs">왜 지금 봐야 하나요? 영향도 {item.impact} 이슈로 의사결정 우선 확인이 필요합니다.</p>
              <div className="button-row">
                <Link
                  href={routeByRole[item.role] ?? "/scenarios/backend"}
                  className="button button-primary"
                  onClick={() => logBriefingEvent("briefing_card_action_click", { action: "scenario", id: item.id, role: item.role })}
                >
                  <span className="button-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
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
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
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
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
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
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
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
