"use client";

import { useEffect, useMemo, useState } from "react";
import ProgressBar from "@/components/progress-bar";
import { recommendations as fallbackRecommendations, scenarios, type Recommendation, type RoleKey } from "@/lib/mvp-data";

type ScenarioExplorerProps = {
  role: RoleKey;
};

type ApiResponse = {
  role: RoleKey;
  recommendations: (Recommendation & RecommendationInsight & { reasons?: string[] })[];
  appliedRules?: string[];
};

type RecommendationTrustLevel = "High" | "Medium" | "Low";

type RecommendationInsight = {
  confidenceScore?: number;
  trustLevel?: RecommendationTrustLevel;
  whyNow?: string;
  tradeoff?: {
    speed: number;
    stability: number;
    scalability: number;
  };
};

type RecommendationItem = Recommendation & RecommendationInsight & { reasons?: string[] };

const presetByRole: Record<RoleKey, { label: string; teamSize: string; timeline: string; priority: string }[]> = {
  backend: [
    { label: "1인 MVP", teamSize: "1~3명", timeline: "2개월", priority: "빠른 출시" },
    { label: "팀 확장", teamSize: "4~8명", timeline: "6개월+", priority: "확장성" },
  ],
  designer: [
    { label: "브랜드 강화", teamSize: "1~3명", timeline: "3개월", priority: "브랜딩" },
    { label: "협업 최적화", teamSize: "2~6명", timeline: "지속", priority: "협업 효율" },
  ],
  pm: [
    { label: "실험 모드", teamSize: "3~10명", timeline: "분기", priority: "실험 속도" },
    { label: "운영 모드", teamSize: "5~15명", timeline: "지속", priority: "리포팅 자동화" },
  ],
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
  const [appliedRules, setAppliedRules] = useState<string[]>([]);
  const [items, setItems] = useState<RecommendationItem[]>(fallbackRecommendations[role]);

  useEffect(() => {
    setTeamSize(teamOptions[0] ?? "");
    setTimeline(timelineOptions[0] ?? "");
    setPriority(priorityOptions[0] ?? "");
    setItems(fallbackRecommendations[role]);
    setAppliedRules([]);
    setError(null);
  }, [priorityOptions, role, teamOptions, timelineOptions]);

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
      setAppliedRules(payload.appliedRules ?? []);
    } catch (fetchError) {
      setItems(fallbackRecommendations[role]);
      setAppliedRules([]);
      setError(fetchError instanceof Error ? fetchError.message : "알 수 없는 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!teamSize || !timeline || !priority) {
      return;
    }

    const timer = setTimeout(() => {
      void searchRecommendations();
    }, 200);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamSize, timeline, priority, role]);

  const getFallbackConfidence = (item: RecommendationItem) => Math.max(45, Math.min(95, Math.round(item.fitScore * 0.82)));

  const getFallbackTrustLevel = (confidenceScore: number): RecommendationTrustLevel => {
    if (confidenceScore >= 80) return "High";
    if (confidenceScore >= 60) return "Medium";
    return "Low";
  };

  const getFallbackTradeoff = (label: Recommendation["label"]) => {
    if (label === "안정형") return { speed: 58, stability: 90, scalability: 72 };
    if (label === "속도형") return { speed: 90, stability: 60, scalability: 63 };
    return { speed: 62, stability: 68, scalability: 93 };
  };

  const getFallbackWhyNow = (label: Recommendation["label"]) => {
    if (label === "안정형") return "운영 안정성과 협업 일관성을 우선할 때 리스크가 가장 낮은 선택입니다.";
    if (label === "속도형") return "최근 빠른 실험-배포 루프가 중요해져 초기 검증 속도에 유리합니다.";
    return "성장 구간에서 구조적 확장 여유를 선반영해야 할 때 효과적입니다.";
  };

  return (
    <>
      <section className="card">
        <h2>조건 기반 추천</h2>
        <p className="muted">팀 규모, 일정, 우선순위를 선택하면 추천안을 다시 계산합니다.</p>
        <div className="chip-row" style={{ marginTop: "0.6rem" }}>
          {presetByRole[role].map((preset) => (
            <button
              key={preset.label}
              type="button"
              className="role-pill"
              onClick={() => {
                setTeamSize(preset.teamSize);
                setTimeline(preset.timeline);
                setPriority(preset.priority);
              }}
            >
              {preset.label}
            </button>
          ))}
        </div>
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
        {appliedRules.length > 0 ? (
          <p className="inline-note" style={{ marginTop: "0.4rem" }}>
            적용 조건: {appliedRules.join(" / ")}
          </p>
        ) : null}
      </section>

      <section className="grid grid-3">
        {items.map((pick, index) => (
          <article className="card" key={pick.label}>
            <p className="eyebrow">{index + 1}순위 · {pick.label}</p>
            <h2>{pick.stack}</h2>
            {(() => {
              const confidenceScore = pick.confidenceScore ?? getFallbackConfidence(pick);
              const trustLevel = pick.trustLevel ?? getFallbackTrustLevel(confidenceScore);
              const tradeoff = pick.tradeoff ?? getFallbackTradeoff(pick.label);
              const whyNow = pick.whyNow ?? getFallbackWhyNow(pick.label);

              return (
                <>
                  <div className="chip-row" style={{ marginTop: "0.2rem" }}>
                    <span className="chip">적합도 {pick.fitScore}점</span>
                    <span className={`trust-badge trust-${trustLevel.toLowerCase()}`}>
                      신뢰도 {trustLevel} ({confidenceScore})
                    </span>
                  </div>
                  <p className="inline-note" style={{ marginTop: "0.45rem" }}>
                    Why now: {whyNow}
                  </p>
                  <p className="list-title">의사결정 트레이드오프</p>
                  <div style={{ display: "grid", gap: "0.45rem" }}>
                    <div>
                      <div className="meter-cell">
                        <span>속도 {tradeoff.speed}</span>
                      </div>
                      <ProgressBar value={tradeoff.speed} />
                    </div>
                    <div>
                      <div className="meter-cell">
                        <span>안정성 {tradeoff.stability}</span>
                      </div>
                      <ProgressBar value={tradeoff.stability} />
                    </div>
                    <div>
                      <div className="meter-cell">
                        <span>확장성 {tradeoff.scalability}</span>
                      </div>
                      <ProgressBar value={tradeoff.scalability} />
                    </div>
                  </div>
                </>
              );
            })()}
            {pick.reasons && pick.reasons.length > 0 ? (
              <>
                <p className="list-title">추천 근거</p>
                <ul>
                  {pick.reasons.map((reason) => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ul>
              </>
            ) : null}
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
