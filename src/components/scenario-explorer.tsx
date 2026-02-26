"use client";

import { useMemo, useState } from "react";
import { recommendations as fallbackRecommendations, scenarios, type Recommendation, type RoleKey } from "@/lib/mvp-data";

type ScenarioExplorerProps = {
  role: RoleKey;
};

type ApiResponse = {
  role: RoleKey;
  recommendations: Recommendation[];
};

export default function ScenarioExplorer({ role }: ScenarioExplorerProps) {
  const roleScenarios = useMemo(() => scenarios.filter((item) => item.role === role), [role]);

  const teamOptions = useMemo(
    () => Array.from(new Set(roleScenarios.map((item) => item.teamSize))),
    [roleScenarios],
  );
  const timelineOptions = useMemo(
    () => Array.from(new Set(roleScenarios.map((item) => item.timeline))),
    [roleScenarios],
  );
  const priorityOptions = useMemo(
    () => Array.from(new Set(roleScenarios.map((item) => item.priority))),
    [roleScenarios],
  );

  const [teamSize, setTeamSize] = useState<string>(teamOptions[0] ?? "");
  const [timeline, setTimeline] = useState<string>(timelineOptions[0] ?? "");
  const [priority, setPriority] = useState<string>(priorityOptions[0] ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<Recommendation[]>(fallbackRecommendations[role]);

  const searchRecommendations = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ role });
      if (teamSize) params.set("teamSize", teamSize);
      if (timeline) params.set("timeline", timeline);
      if (priority) params.set("priority", priority);

      const response = await fetch(`/api/recommendations?${params.toString()}`, {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-store",
      });

      const payload = (await response.json()) as Partial<ApiResponse> & { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "추천 데이터를 불러오지 못했습니다.");
      }

      if (!payload.recommendations || payload.recommendations.length === 0) {
        throw new Error("추천 결과가 비어 있습니다.");
      }

      setItems(payload.recommendations);
    } catch (fetchError) {
      setItems(fallbackRecommendations[role]);
      setError(fetchError instanceof Error ? fetchError.message : "알 수 없는 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <section className="card">
        <h2>조건 기반 추천</h2>
        <p className="muted">팀 규모, 일정, 우선순위를 선택하면 추천안을 다시 계산합니다.</p>
        <div className="filter-grid">
          <label className="field">
            <span>팀 규모</span>
            <select value={teamSize} onChange={(event) => setTeamSize(event.target.value)}>
              {teamOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>일정</span>
            <select value={timeline} onChange={(event) => setTimeline(event.target.value)}>
              {timelineOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>우선순위</span>
            <select value={priority} onChange={(event) => setPriority(event.target.value)}>
              {priorityOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="button-row">
          <button type="button" className="button button-primary" onClick={searchRecommendations} disabled={loading}>
            {loading ? "추천 계산 중..." : "추천 다시 계산"}
          </button>
          <span className="inline-note">API rate limit: 분당 30회</span>
        </div>
        {error ? <p className="error-text">{error} (기본 추천안으로 표시 중)</p> : null}
      </section>

      <section className="grid grid-3">
        {items.map((pick) => (
          <article className="card" key={pick.label}>
            <p className="eyebrow">{pick.label}</p>
            <h2>{pick.stack}</h2>
            <p className="muted">적합도 {pick.fitScore}점</p>
            <p className="list-title">장점</p>
            <ul>
              {pick.pros.map((pro) => (
                <li key={pro}>{pro}</li>
              ))}
            </ul>
            <p className="list-title">리스크</p>
            <ul>
              {pick.risks.map((risk) => (
                <li key={risk}>{risk}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>
    </>
  );
}
