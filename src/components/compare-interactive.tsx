"use client";

import { useEffect, useMemo, useState } from "react";
import ProgressBar from "@/components/progress-bar";
import WatchlistToggle from "@/components/watchlist-toggle";
import { roles, trendData, type RoleKey } from "@/lib/mvp-data";
import type { TrendMetric } from "@/lib/mvp-data";

/** 비교 테이블 한 행에 표시할 도구 지표 */
type CompareItem = {
  name: string;
  adoption: number;
  growth: number;
  difficulty: number;
  complexity: number;
  cost: number;
  activity: number;
  community: number;
  stability: number;
  confidence: number;
  trustLevel: "High" | "Medium" | "Low";
};

const difficultyMap: Record<"낮음" | "중간" | "높음", number> = {
  낮음: 32,
  중간: 56,
  높음: 74,
};

const defaultSelectedByRole: Record<RoleKey, string[]> = {
  backend: ["Node.js", "Spring Boot", "Go"],
  designer: ["Figma", "Framer", "Rive"],
  pm: ["Notion", "Jira", "Linear"],
};

/**
 * 직무별 후보를 선택해 핵심 지표를 나란히 비교하는 인터랙션 컴포넌트다.
 * @returns 비교 화면 본문
 */
export default function CompareInteractive() {
  const [role, setRole] = useState<RoleKey>("backend");
  const [selected, setSelected] = useState<Set<string>>(new Set(defaultSelectedByRole.backend));
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  const [selectionNotice, setSelectionNotice] = useState<string | null>(null);
  const [liveMetrics, setLiveMetrics] = useState<TrendMetric[] | null>(null);
  const [mode, setMode] = useState<"live" | "fallback" | "loading">("loading");
  const [loadError, setLoadError] = useState<string | null>(null);

  const maxSelectable = isAdvancedMode ? 8 : 4;

  useEffect(() => {
    let active = true;
    /**
     * 현재 직무의 트렌드 지표를 API에서 가져오고 실패 시 폴백 모드로 전환한다.
     * @returns 없음
     */
    const fetchMetrics = async () => {
      setMode("loading");
      setLoadError(null);
      try {
        const response = await fetch(`/api/trends/${role}`, {
          method: "GET",
          headers: { Accept: "application/json" },
          cache: "no-store",
        });
        const payload = (await response.json()) as {
          metrics?: TrendMetric[];
          mode?: "live" | "fallback";
          error?: string;
        };

        if (!response.ok || !payload.metrics) {
          throw new Error(payload.error ?? "트렌드 데이터를 불러오지 못했습니다.");
        }

        if (!active) return;
        setLiveMetrics(payload.metrics);
        setMode(payload.mode ?? "fallback");
      } catch (error) {
        if (!active) return;
        setLiveMetrics(null);
        setMode("fallback");
        setLoadError(error instanceof Error ? error.message : "알 수 없는 오류");
      }
    };

    fetchMetrics();
    return () => {
      active = false;
    };
  }, [role]);

  const compareItems = useMemo(() => {
    const input = liveMetrics ?? trendData[role];
    return input.map((item) => {
      const difficulty = difficultyMap[item.difficulty];
      const complexity = Math.round(Math.min(90, difficulty * 0.65 + item.demandIndex * 0.35));
      const cost = Math.round(Math.min(90, 95 - item.adoptionRate + complexity * 0.25));

      return {
        name: item.tool,
        adoption: item.adoptionRate,
        growth: item.growthRate,
        difficulty,
        complexity,
        cost,
        activity: item.activityScore ?? Math.round(item.growthRate * 3),
        community: item.communityScore ?? item.demandIndex,
        stability: item.stabilityScore ?? item.demandIndex,
        confidence: item.confidenceScore ?? 60,
        trustLevel: item.trustLevel ?? "Medium",
      };
    });
  }, [liveMetrics, role]);

  /**
   * 직무를 전환하고 해당 직무의 기본 비교 선택값으로 초기화한다.
   * @param nextRole 전환할 직무 키
   * @returns 없음
   */
  const switchRole = (nextRole: RoleKey) => {
    setRole(nextRole);
    setSelected(new Set(defaultSelectedByRole[nextRole]));
    setSelectionNotice(null);
  };

  const selectedItems = useMemo(
    () => compareItems.filter((item) => selected.has(item.name)),
    [compareItems, selected],
  );

  const bestCandidate = useMemo(() => {
    if (selectedItems.length === 0) return null;

    const scored = selectedItems.map((item) => {
      const overall = Math.round(
        item.adoption * 0.3 +
          item.growth * 0.22 +
          item.stability * 0.2 +
          item.confidence * 0.18 -
          item.cost * 0.1,
      );

      return { item, overall };
    });

    scored.sort((a, b) => b.overall - a.overall);
    return scored[0] ?? null;
  }, [selectedItems]);

  /**
   * 비교 후보 선택 상태를 토글하며 최소 1개, 최대 4개 제약을 유지한다.
   * @param name 토글할 후보 이름
   * @returns 없음
   */
  const toggleSelection = (name: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        if (next.size === 1) {
          setSelectionNotice("최소 1개는 선택되어야 합니다.");
          return prev;
        }
        next.delete(name);
        setSelectionNotice(null);
        return next;
      }

      if (next.size >= maxSelectable) {
        setSelectionNotice(
          isAdvancedMode
            ? "고급 모드에서는 최대 8개까지 선택할 수 있습니다."
            : "기본 모드에서는 최대 4개까지 선택됩니다. 더 보려면 고급 모드를 켜세요.",
        );
        return prev;
      }

      next.add(name);
      setSelectionNotice(null);
      return next;
    });
  };

  /**
   * 비교 모드를 전환하고 선택 상한을 초과하면 최신 선택 기준으로 잘라낸다.
   * @param nextAdvanced 전환할 고급 모드 여부
   */
  const switchCompareMode = (nextAdvanced: boolean) => {
    setIsAdvancedMode(nextAdvanced);
    setSelected((prev) => {
      const max = nextAdvanced ? 8 : 4;
      if (prev.size <= max) {
        return prev;
      }
      const trimmed = new Set(Array.from(prev).slice(0, max));
      return trimmed;
    });
    if (!nextAdvanced && selectedItems.length > 4) {
      setSelectionNotice("기본 모드로 전환되어 선택 항목이 4개로 조정되었습니다.");
    } else {
      setSelectionNotice(null);
    }
  };

  return (
    <>
      <section className="card">
        <div className="role-switch">
          {roles.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`role-pill ${item.key === role ? "role-pill-active" : ""}`}
              onClick={() => switchRole(item.key)}
            >
              {item.name}
            </button>
          ))}
        </div>
        <div className="topn-switch mt-md" role="tablist" aria-label="비교 모드 선택">
          <button
            type="button"
            role="tab"
            aria-selected={!isAdvancedMode}
            className={`role-pill ${!isAdvancedMode ? "role-pill-active" : ""}`}
            onClick={() => switchCompareMode(false)}
          >
            기본 모드 (최대 4개)
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={isAdvancedMode}
            className={`role-pill ${isAdvancedMode ? "role-pill-active" : ""}`}
            onClick={() => switchCompareMode(true)}
          >
            고급 모드 (최대 8개)
          </button>
        </div>
        <h2>비교할 기술 선택 (최대 {maxSelectable}개)</h2>
        <p className="inline-note mt-xs">현재 {selectedItems.length}/{maxSelectable}개 선택됨</p>
        <div className="checkbox-grid">
          {compareItems.map((item) => {
            const checked = selected.has(item.name);
            const disabled = !checked && selected.size >= maxSelectable;
            return (
              <div key={item.name} className={`check-card ${checked ? "check-card-on" : ""}`}>
                <input
                  id={`compare-${role}-${item.name}`}
                  type="checkbox"
                  checked={checked}
                  disabled={disabled}
                  onChange={() => toggleSelection(item.name)}
                  aria-label={`${item.name} 비교 선택`}
                />
                <label htmlFor={`compare-${role}-${item.name}`}>{item.name}</label>
                <small>채택 {item.adoption}%</small>
                <WatchlistToggle itemKey={`${role}:${item.name}`} label={item.name} />
              </div>
            );
          })}
        </div>
        {selectionNotice ? <p className="inline-note mt-sm">{selectionNotice}</p> : null}
        <p className="inline-note mt-sm readable">
          현재 비교 기준: {roles.find((item) => item.key === role)?.name} · 데이터 모드: {mode.toUpperCase()}
        </p>
        {loadError ? <p className="error-text">{loadError} (샘플 데이터로 표시 중)</p> : null}
      </section>

      {bestCandidate ? (
        <section className="card decision-banner">
          <p className="decision-title">비교 요약</p>
          <p className="decision-main">
            현재 선택에서 가장 균형적인 후보는 {bestCandidate.item.name} ({bestCandidate.overall}점)입니다.
          </p>
          <ul className="summary-list">
            <li>채택률·성장률·안정성·신뢰도를 함께 보되 비용 부담은 감점 반영합니다.</li>
            <li>실제 도입 전에는 러닝커브와 운영복잡도를 팀 역량과 함께 확인하세요.</li>
          </ul>
        </section>
      ) : null}

      <section className="card">
        <h2>비교 결과</h2>
        <div className="table-wrap">
          <table>
            <caption className="sr-only">선택한 도구 비교표: 채택률, 성장률, 난이도, 운영복잡도, 비용부담, 신뢰도</caption>
            <thead>
              <tr>
                <th>기술</th>
                <th>채택률</th>
                <th>성장률</th>
                <th>러닝커브</th>
                <th>운영복잡도</th>
                <th>비용부담</th>
                <th>활동성</th>
                <th>커뮤니티</th>
                <th>안정성</th>
                <th>신뢰도</th>
              </tr>
            </thead>
            <tbody>
              {selectedItems.map((item) => (
                <tr key={item.name}>
                  <td>{item.name}</td>
                  <td>{item.adoption}%</td>
                  <td>+{item.growth}%</td>
                  <td>
                    <ProgressBar value={item.difficulty} />
                  </td>
                  <td>
                    <ProgressBar value={item.complexity} />
                  </td>
                  <td>
                    <ProgressBar value={item.cost} />
                  </td>
                  <td>{item.activity}</td>
                  <td>{item.community}</td>
                  <td>{item.stability}</td>
                  <td>
                    <span className={`trust-badge trust-${item.trustLevel.toLowerCase()}`}>
                      {item.trustLevel} ({item.confidence})
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
