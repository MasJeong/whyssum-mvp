"use client";

import { useEffect, useMemo, useState } from "react";
import ProgressBar from "@/components/progress-bar";
import WatchlistToggle from "@/components/watchlist-toggle";
import { roles, trendData, type RoleKey } from "@/lib/mvp-data";
import type { TrendMetric } from "@/lib/mvp-data";

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

export default function CompareInteractive() {
  const [role, setRole] = useState<RoleKey>("backend");
  const [selected, setSelected] = useState<Set<string>>(new Set(defaultSelectedByRole.backend));
  const [liveMetrics, setLiveMetrics] = useState<TrendMetric[] | null>(null);
  const [mode, setMode] = useState<"live" | "fallback" | "loading">("loading");
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
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

  const switchRole = (nextRole: RoleKey) => {
    setRole(nextRole);
    setSelected(new Set(defaultSelectedByRole[nextRole]));
  };

  const selectedItems = useMemo(
    () => compareItems.filter((item) => selected.has(item.name)),
    [compareItems, selected],
  );

  const toggleSelection = (name: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        if (next.size === 1) {
          return prev;
        }
        next.delete(name);
        return next;
      }

      if (next.size >= 4) {
        return prev;
      }

      next.add(name);
      return next;
    });
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
        <h2>비교할 기술 선택 (최대 4개)</h2>
        <div className="checkbox-grid">
          {compareItems.map((item) => {
            const checked = selected.has(item.name);
            return (
              <div key={item.name} className={`check-card ${checked ? "check-card-on" : ""}`}>
                <input
                  id={`compare-${role}-${item.name}`}
                  type="checkbox"
                  checked={checked}
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
        <p className="inline-note" style={{ marginTop: "0.6rem" }}>
          현재 비교 기준: {roles.find((item) => item.key === role)?.name} · 데이터 모드: {mode.toUpperCase()}
        </p>
        {loadError ? <p className="error-text">{loadError} (샘플 데이터로 표시 중)</p> : null}
      </section>

      <section className="card">
        <h2>비교 결과</h2>
        <div className="table-wrap">
          <table>
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
