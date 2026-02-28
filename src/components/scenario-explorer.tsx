"use client";

import { useEffect, useMemo, useState } from "react";
import ProgressBar from "@/components/progress-bar";
import { recommendations as fallbackRecommendations, scenarios, type Recommendation, type RoleKey } from "@/lib/mvp-data";

/** 상황추천 탐색기 컴포넌트에 전달하는 props */
type ScenarioExplorerProps = {
  role: RoleKey;
  initialSelection?: {
    teamSize?: string;
    timeline?: string;
    priority?: string;
  };
};

/** /api/recommendations 응답 JSON 형태 */
type ApiResponse = {
  role: RoleKey;
  recommendations: (Recommendation & RecommendationInsight & { reasons?: string[] })[];
  appliedRules?: string[];
};

/** 추천 신뢰도 구간 (높음/보통/낮음) */
type RecommendationTrustLevel = "High" | "Medium" | "Low";

/** API가 부가한 신뢰도·트렌드·트레이드오프 등 인사이트 필드 */
type RecommendationInsight = {
  confidenceScore?: number;
  trustLevel?: RecommendationTrustLevel;
  whyNow?: string;
  baseFitScore?: number;
  scoreDelta?: number;
  trendSignal?: number;
  reasonCount?: number;
  tradeoff?: {
    speed: number;
    stability: number;
    scalability: number;
  };
};

/** 추천 1건 = 기본 추천 + 인사이트 + 선택적 근거 목록 */
type RecommendationItem = Recommendation & RecommendationInsight & { reasons?: string[] };

/** 저장된 상황 선택 스냅샷 (로컬 스토리지용) */
type ScenarioSnapshot = {
  id: string;
  role: RoleKey;
  teamSize: string;
  timeline: string;
  priority: string;
  updatedAt: number;
};

/** 마지막 선택한 팀규모·일정·우선순위 (재방문 시 복원용) */
type LastScenarioSelection = {
  teamSize: string;
  timeline: string;
  priority: string;
};

const SNAPSHOT_STORAGE_KEY = "whyssum:scenario-snapshots";
const LAST_SELECTION_STORAGE_KEY = "whyssum:last-scenario-selection";
const MAX_SNAPSHOTS_PER_ROLE = 8;

/**
 * 저장소의 스냅샷 배열을 읽고 타입가드로 유효 항목만 반환한다.
 * @returns 유효한 시나리오 스냅샷 목록
 */
function readAllScenarioSnapshots(): ScenarioSnapshot[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(SNAPSHOT_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((item): item is ScenarioSnapshot => {
      if (!item || typeof item !== "object") return false;
      if (typeof item.id !== "string") return false;
      if (item.role !== "backend" && item.role !== "designer" && item.role !== "pm") return false;
      if (typeof item.teamSize !== "string") return false;
      if (typeof item.timeline !== "string") return false;
      if (typeof item.priority !== "string") return false;
      if (typeof item.updatedAt !== "number") return false;
      return true;
    });
  } catch {
    return [];
  }
}

/**
 * 시나리오 스냅샷 목록을 로컬 저장소에 직렬화해 저장한다.
 * @param items 저장할 스냅샷 목록
 * @returns 없음
 */
function writeAllScenarioSnapshots(items: ScenarioSnapshot[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SNAPSHOT_STORAGE_KEY, JSON.stringify(items));
}

/**
 * 특정 직무의 스냅샷만 최신순으로 읽고 최대 개수로 제한한다.
 * @param role 조회할 직무 키
 * @returns 정렬/제한된 스냅샷 목록
 */
function readSnapshotsByRole(role: RoleKey): ScenarioSnapshot[] {
  return readAllScenarioSnapshots()
    .filter((item) => item.role === role)
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, MAX_SNAPSHOTS_PER_ROLE);
}

/**
 * 현재 직무의 마지막 선택값을 저장해 다음 방문 시 복원 가능하게 한다.
 * @param role 직무 키
 * @param selection 저장할 필터 선택값
 * @returns 없음
 */
function saveLastScenarioSelection(role: RoleKey, selection: LastScenarioSelection) {
  if (typeof window === "undefined") return;

  try {
    const raw = window.localStorage.getItem(LAST_SELECTION_STORAGE_KEY);
    const base: Partial<Record<RoleKey, LastScenarioSelection>> = raw ? (JSON.parse(raw) as Partial<Record<RoleKey, LastScenarioSelection>>) : {};
    base[role] = selection;
    window.localStorage.setItem(LAST_SELECTION_STORAGE_KEY, JSON.stringify(base));
  } catch {
    return;
  }
}

/**
 * 저장된 마지막 선택값을 읽고 타입이 유효한 경우에만 반환한다.
 * @param role 조회할 직무 키
 * @returns 마지막 선택값 또는 null
 */
function readLastScenarioSelection(role: RoleKey): LastScenarioSelection | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(LAST_SELECTION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Record<RoleKey, LastScenarioSelection>>;
    const hit = parsed[role];
    if (!hit) return null;
    if (typeof hit.teamSize !== "string" || typeof hit.timeline !== "string" || typeof hit.priority !== "string") {
      return null;
    }

    return hit;
  } catch {
    return null;
  }
}

/**
 * 스냅샷 식별자를 생성한다.
 * @returns 충돌 가능성을 낮춘 스냅샷 ID 문자열
 */
function createSnapshotId() {
  return `snapshot-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

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

/**
 * 상황추천 화면에서 조건 기반 재계산/저장/상세 해설을 제공한다.
 * @param role 현재 직무 키
 * @param initialSelection URL 파라미터 기반 초기 필터 값
 * @returns 상황추천 인터랙션 UI
 */
export default function ScenarioExplorer({ role, initialSelection }: ScenarioExplorerProps) {
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
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [appliedRules, setAppliedRules] = useState<string[]>([]);
  const [savedSnapshots, setSavedSnapshots] = useState<ScenarioSnapshot[]>([]);
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  const [items, setItems] = useState<RecommendationItem[]>(fallbackRecommendations[role]);
  const topPick = items[0];

  useEffect(() => {
    // 역할 전환 시 해당 역할의 마지막 선택값을 우선 복원하고,
    // 옵션에 없는 값이면 안전하게 첫 옵션으로 폴백한다.
    const lastSelection = readLastScenarioSelection(role);

    const requestedTeam = initialSelection?.teamSize;
    const requestedTimeline = initialSelection?.timeline;
    const requestedPriority = initialSelection?.priority;

    const nextTeam =
      requestedTeam && teamOptions.includes(requestedTeam)
        ? requestedTeam
        : lastSelection && teamOptions.includes(lastSelection.teamSize)
          ? lastSelection.teamSize
          : (teamOptions[0] ?? "");
    const nextTimeline =
      requestedTimeline && timelineOptions.includes(requestedTimeline)
        ? requestedTimeline
        : lastSelection && timelineOptions.includes(lastSelection.timeline)
          ? lastSelection.timeline
          : (timelineOptions[0] ?? "");
    const nextPriority =
      requestedPriority && priorityOptions.includes(requestedPriority)
        ? requestedPriority
        : lastSelection && priorityOptions.includes(lastSelection.priority)
          ? lastSelection.priority
          : (priorityOptions[0] ?? "");

    setTeamSize(nextTeam);
    setTimeline(nextTimeline);
    setPriority(nextPriority);
    setItems(fallbackRecommendations[role]);
    setAppliedRules([]);
    setError(null);
    setSaveMessage(null);
    setExpandedCards({});
    setSavedSnapshots(readSnapshotsByRole(role));
  }, [initialSelection?.priority, initialSelection?.teamSize, initialSelection?.timeline, priorityOptions, role, teamOptions, timelineOptions]);

  useEffect(() => {
    if (!teamSize || !timeline || !priority) {
      return;
    }

    saveLastScenarioSelection(role, { teamSize, timeline, priority });
  }, [priority, role, teamSize, timeline]);

  /**
   * 현재 필터를 기준으로 추천 API를 호출하고 결과 상태를 갱신한다.
   * @returns 없음
   */
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
    // 필터 변경마다 즉시 호출하지 않고 200ms 디바운스로 API 호출량을 줄인다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamSize, timeline, priority, role]);

  /**
   * API 보조 지표가 없을 때 적합도 기반 신뢰도 점수를 계산한다.
   * @param item 추천 카드 데이터
   * @returns 대체 신뢰도 점수
   */
  const getFallbackConfidence = (item: RecommendationItem) => Math.max(45, Math.min(95, Math.round(item.fitScore * 0.82)));

  /**
   * 신뢰도 점수를 뱃지 구간(High/Medium/Low)으로 변환한다.
   * @param confidenceScore 신뢰도 점수
   * @returns 신뢰도 레벨
   */
  const getFallbackTrustLevel = (confidenceScore: number): RecommendationTrustLevel => {
    if (confidenceScore >= 80) return "High";
    if (confidenceScore >= 60) return "Medium";
    return "Low";
  };

  /**
   * 추천 타입별 기본 트레이드오프 축 값을 반환한다.
   * @param label 추천 타입 라벨
   * @returns 속도/안정성/확장성 기본 점수
   */
  const getFallbackTradeoff = (label: Recommendation["label"]) => {
    if (label === "안정형") return { speed: 58, stability: 90, scalability: 72 };
    if (label === "속도형") return { speed: 90, stability: 60, scalability: 63 };
    return { speed: 62, stability: 68, scalability: 93 };
  };

  /**
   * 추천 타입별 기본 한 줄 해설을 제공한다.
   * @param label 추천 타입 라벨
   * @returns 기본 Why-now 문구
   */
  const getFallbackWhyNow = (label: Recommendation["label"]) => {
    if (label === "안정형") return "운영 안정성과 협업 일관성을 우선할 때 리스크가 가장 낮은 선택입니다.";
    if (label === "속도형") return "최근 빠른 실험-배포 루프가 중요해져 초기 검증 속도에 유리합니다.";
    return "성장 구간에서 구조적 확장 여유를 선반영해야 할 때 효과적입니다.";
  };

  /**
   * 현재 필터 조합을 스냅샷으로 저장하거나 기존 항목을 갱신한다.
   * @returns 없음
   */
  const saveCurrentSnapshot = () => {
    if (!teamSize || !timeline || !priority) return;

    const allSnapshots = readAllScenarioSnapshots();
    const now = Date.now();
    const duplicated = allSnapshots.find(
      (item) =>
        item.role === role && item.teamSize === teamSize && item.timeline === timeline && item.priority === priority,
    );

    let nextAll: ScenarioSnapshot[];
    if (duplicated) {
      nextAll = allSnapshots.map((item) =>
        item.id === duplicated.id
          ? {
              ...item,
              updatedAt: now,
            }
          : item,
      );
      setSaveMessage("기존 저장 조건의 갱신 시각을 업데이트했습니다.");
    } else {
      nextAll = [
        ...allSnapshots,
        {
          id: createSnapshotId(),
          role,
          teamSize,
          timeline,
          priority,
          updatedAt: now,
        },
      ];
      setSaveMessage("현재 조건을 저장했습니다. 다음 방문에서 바로 불러올 수 있습니다.");
    }

    const roleItems = nextAll
      .filter((item) => item.role === role)
      .sort((a, b) => b.updatedAt - a.updatedAt);
    const roleKeepIds = new Set(roleItems.slice(0, MAX_SNAPSHOTS_PER_ROLE).map((item) => item.id));

    // 역할별 저장 개수 상한을 유지해 스냅샷이 무한히 쌓이지 않도록 제한한다.
    nextAll = nextAll.filter((item) => item.role !== role || roleKeepIds.has(item.id));

    writeAllScenarioSnapshots(nextAll);
    setSavedSnapshots(readSnapshotsByRole(role));
  };

  /**
   * 저장된 스냅샷을 현재 필터 상태로 적용한다.
   * @param snapshot 적용할 스냅샷
   * @returns 없음
   */
  const applySnapshot = (snapshot: ScenarioSnapshot) => {
    setTeamSize(snapshot.teamSize);
    setTimeline(snapshot.timeline);
    setPriority(snapshot.priority);
    setSaveMessage("저장된 조건을 불러왔습니다.");
  };

  /**
   * 특정 스냅샷을 삭제하고 목록을 다시 로드한다.
   * @param id 삭제할 스냅샷 ID
   * @returns 없음
   */
  const removeSnapshot = (id: string) => {
    const nextAll = readAllScenarioSnapshots().filter((item) => item.id !== id);
    writeAllScenarioSnapshots(nextAll);
    setSavedSnapshots(readSnapshotsByRole(role));
    setSaveMessage("저장 조건을 삭제했습니다.");
  };

  /**
   * 현재 직무의 저장 스냅샷을 모두 삭제한다.
   * @returns 없음
   */
  const clearRoleSnapshots = () => {
    const nextAll = readAllScenarioSnapshots().filter((item) => item.role !== role);
    writeAllScenarioSnapshots(nextAll);
    setSavedSnapshots([]);
    setSaveMessage("이 직무의 저장 조건을 모두 삭제했습니다.");
  };

  /**
   * 카드 상세 열림 상태를 토글한다.
   * @param cardKey 카드 고유 키
   * @returns 없음
   */
  const toggleCardDetail = (cardKey: string) => {
    setExpandedCards((prev) => ({
      ...prev,
      [cardKey]: !prev[cardKey],
    }));
  };

  /**
   * 적합도 점수를 사용자 친화적인 범주로 매핑한다.
   * @param score 적합도 점수
   * @returns 추천 강도 라벨
   */
  const getFitCategory = (score: number) => {
    if (score >= 85) return "강력 추천";
    if (score >= 70) return "추천";
    return "조건부 추천";
  };

  /**
   * 리스크 개수를 위험도 라벨로 변환한다.
   * @param riskCount 리스크 항목 개수
   * @returns 위험도 라벨
   */
  const getRiskLevel = (riskCount: number) => {
    if (riskCount >= 3) return "높음";
    if (riskCount >= 2) return "보통";
    return "낮음";
  };

  /**
   * 세 축 중 가장 강한 의사결정 축을 계산한다.
   * @param tradeoff 트레이드오프 축 점수
   * @returns 우세 축 라벨과 점수
   */
  const getDominantAxis = (tradeoff: { speed: number; stability: number; scalability: number }) => {
    if (tradeoff.speed >= tradeoff.stability && tradeoff.speed >= tradeoff.scalability) {
      return { label: "속도 중심", value: tradeoff.speed };
    }

    if (tradeoff.stability >= tradeoff.speed && tradeoff.stability >= tradeoff.scalability) {
      return { label: "안정성 중심", value: tradeoff.stability };
    }

    return { label: "확장성 중심", value: tradeoff.scalability };
  };

  /**
   * 점수/리스크/규칙 반영 결과를 기반으로 실행 체크리스트를 동적으로 구성한다.
   * @param input 카드 상세 해설 생성에 필요한 입력 값 묶음
   * @returns 최대 6개의 실행 체크리스트
   */
  const buildDynamicChecklist = (input: {
    scoreDelta: number;
    dominantAxis: { label: string; value: number };
    confidenceScore: number;
    tradeoff: { speed: number; stability: number; scalability: number };
    riskCount: number;
    reasonCount: number;
    appliedRuleCount: number;
  }) => {
    const items: string[] = [];

    items.push(`현재 추천은 ${input.dominantAxis.label} 축이 ${input.dominantAxis.value}점으로 가장 강합니다.`);

    if (input.scoreDelta >= 8) {
      items.push(`선택한 조건 영향으로 기본 점수 대비 +${input.scoreDelta}점 상승했습니다.`);
    } else if (input.scoreDelta <= -5) {
      items.push(`선택한 조건 영향으로 기본 점수 대비 ${input.scoreDelta}점 하락해 대안 비교가 필요합니다.`);
    } else {
      items.push(`조건 영향은 ${input.scoreDelta >= 0 ? `+${input.scoreDelta}` : input.scoreDelta}점으로 기준 추천과 유사합니다.`);
    }

    if (input.confidenceScore >= 80) {
      items.push("신뢰도 높음 구간이므로 초기 도입 범위를 빠르게 확정해도 됩니다.");
    } else if (input.confidenceScore >= 60) {
      items.push("신뢰도 중간 구간이라 핵심 지표를 정하고 1차 검증 후 확장하는 편이 안전합니다.");
    } else {
      items.push("신뢰도 낮음 구간이라 우선순위나 일정 조건을 조정해 재계산하는 것을 권장합니다.");
    }

    if (input.riskCount >= 3) {
      items.push("리스크 항목이 많아 2주 단위 리스크 점검 루틴을 포함해 실행하세요.");
    } else if (input.riskCount === 0) {
      items.push("리스크가 낮은 편이라 빠른 실험-피드백 루프로 학습 속도를 높일 수 있습니다.");
    }

    if (input.tradeoff.scalability < 60) {
      items.push("확장성 점수가 낮으므로 사용자 증가 시점을 가정한 확장 계획을 미리 분리하세요.");
    }

    if (input.tradeoff.stability < 60) {
      items.push("안정성 점수가 낮아 모니터링/롤백 기준을 먼저 정의하는 것이 좋습니다.");
    }

    if (input.appliedRuleCount > 0) {
      items.push(`현재 계산에는 ${input.appliedRuleCount}개의 조건 규칙이 반영되었습니다.`);
    }

    if (input.reasonCount > 0) {
      items.push(`추천 근거 ${input.reasonCount}개를 우선순위 문서에 그대로 옮기면 팀 합의가 빨라집니다.`);
    }

    return items.slice(0, 6);
  };

  return (
    <>
      <section className="card">
        <h2>조건 기반 추천</h2>
        <p className="muted">팀 규모, 일정, 우선순위를 선택하면 추천안을 다시 계산합니다.</p>
        <div className="chip-row mt-sm">
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
            <span className="button-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 12a8 8 0 1 1-2.3-5.7" />
                <path d="M20 5v5h-5" />
              </svg>
            </span>
            {loading ? "추천 계산 중..." : "추천 다시 계산"}
          </button>
          <button type="button" className="button button-ghost" onClick={saveCurrentSnapshot}>
            <span className="button-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 5.5h10v13l-5-2.7-5 2.7v-13z" />
              </svg>
            </span>
            현재 조건 저장
          </button>
          <span className="inline-note">API rate limit: 분당 30회</span>
        </div>
        {error ? <p className="error-text">{error} (기본 추천안으로 표시 중)</p> : null}
        {saveMessage ? (
          <p className="inline-note mt-xs">
            {saveMessage}
          </p>
        ) : null}
        {appliedRules.length > 0 ? (
          <p className="inline-note mt-xs">
            적용 조건: {appliedRules.join(" / ")}
          </p>
        ) : null}

        {savedSnapshots.length > 0 ? (
          <div className="mt-md">
            <div className="split-note mb-xs">
              <p className="list-title no-margin">
                저장한 조건 {savedSnapshots.length}개
              </p>
              <button type="button" className="button button-ghost" onClick={clearRoleSnapshots}>
                <span className="button-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 7h16" />
                    <path d="M9.5 7v10" />
                    <path d="M14.5 7v10" />
                    <path d="M6.5 7l1 12h9l1-12" />
                  </svg>
                </span>
                모두 삭제
              </button>
            </div>
            <div className="chip-row">
              {savedSnapshots.map((snapshot) => (
                <div key={snapshot.id} className="inline-cluster">
                  <button
                    type="button"
                    className="role-pill"
                    onClick={() => applySnapshot(snapshot)}
                    title={`${snapshot.teamSize} · ${snapshot.timeline} · ${snapshot.priority}`}
                  >
                    {snapshot.teamSize} · {snapshot.timeline} · {snapshot.priority}
                  </button>
                  <button
                    type="button"
                    className="button button-ghost button-compact"
                    onClick={() => removeSnapshot(snapshot.id)}
                    aria-label="저장 조건 삭제"
                  >
                    삭제
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      {topPick ? (
        <section className="card decision-banner">
          <p className="decision-title">지금 조건의 한 줄 결론</p>
          <p className="decision-main">
            1순위는 {topPick.label} ({topPick.stack})이며, 적합도 {topPick.fitScore}점입니다.
          </p>
          <ul className="summary-list">
            <li>현재 선택 조건과 가장 잘 맞는 실행 전략으로 계산되었습니다.</li>
            <li>자세히 보기를 열면 점수 구조와 실행 체크리스트를 바로 확인할 수 있습니다.</li>
            <li>결정이 애매하면 비교 화면에서 후보 2~4개를 나란히 확인하세요.</li>
          </ul>
        </section>
      ) : null}

      <section className="grid grid-3">
        {items.map((pick, index) => (
          <article className="card" key={pick.label}>
            <p className="eyebrow">{index + 1}순위 · {pick.label}</p>
            <h2>{pick.stack}</h2>
            {(() => {
              const cardKey = `${pick.label}-${index}`;
              const isExpanded = expandedCards[cardKey] ?? false;
              const confidenceScore = pick.confidenceScore ?? getFallbackConfidence(pick);
              const trustLevel = pick.trustLevel ?? getFallbackTrustLevel(confidenceScore);
              const tradeoff = pick.tradeoff ?? getFallbackTradeoff(pick.label);
              const whyNow = pick.whyNow ?? getFallbackWhyNow(pick.label);
              const fitCategory = getFitCategory(pick.fitScore);
              const riskLevel = getRiskLevel(pick.risks.length);
              const dominantAxis = getDominantAxis(tradeoff);
              const baseFitScore = pick.baseFitScore ?? pick.fitScore;
              const scoreDelta = pick.scoreDelta ?? pick.fitScore - baseFitScore;
              const trendSignal = pick.trendSignal ?? confidenceScore;
              const reasonCount = pick.reasonCount ?? pick.reasons?.length ?? 0;
              const checklist = buildDynamicChecklist({
                scoreDelta,
                dominantAxis,
                confidenceScore,
                tradeoff,
                riskCount: pick.risks.length,
                reasonCount,
                appliedRuleCount: appliedRules.length,
              });

              return (
                <>
                  <div className="chip-row mt-xs">
                    <span className="chip">적합도 {pick.fitScore}점</span>
                    <span className={`trust-badge trust-${trustLevel.toLowerCase()}`}>
                      신뢰도 {trustLevel} ({confidenceScore})
                    </span>
                    <span className="chip">판단 {fitCategory}</span>
                  </div>
                  <p className="inline-note mt-xs">
                    Why now: {whyNow}
                  </p>
                  <p className="list-title">의사결정 트레이드오프</p>
                  <div className="stack-sm">
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

                  <div className="button-row mt-sm">
                    <button
                      type="button"
                      className="button button-ghost"
                      onClick={() => toggleCardDetail(cardKey)}
                      aria-expanded={isExpanded}
                      aria-controls={`recommendation-detail-${cardKey}`}
                    >
                      {isExpanded ? "간단히 보기" : "자세히 보기"}
                    </button>
                    <span className="inline-note">주력 포인트: {dominantAxis.label}</span>
                  </div>

                  {isExpanded ? (
                    <div id={`recommendation-detail-${cardKey}`} className="stack-md mt-sm">
                      <div>
                        <p className="list-title">상황 해설</p>
                        <ul>
                          <li>현재 조건: {teamSize || "-"} · {timeline || "-"} · {priority || "-"}</li>
                          <li>점수 구조: 기본 {baseFitScore}점 → 조건 반영 {pick.fitScore}점 ({scoreDelta >= 0 ? `+${scoreDelta}` : scoreDelta})</li>
                          <li>트렌드 신호 반영 점수: {trendSignal}</li>
                          <li>이 추천은 {dominantAxis.label} 의사결정에서 우선순위가 높게 계산되었습니다.</li>
                          <li>신뢰도 {trustLevel} / 리스크 {riskLevel} 상태입니다.</li>
                        </ul>
                      </div>

                      <div>
                        <p className="list-title">실행 체크리스트 (바로 적용)</p>
                        <ul>
                          {checklist.map((item) => (
                            <li key={`${pick.label}-${item}`}>{item}</li>
                          ))}
                        </ul>
                      </div>

                      {appliedRules.length > 0 ? (
                        <div>
                          <p className="list-title">이번 계산에 반영된 조건</p>
                          <div className="chip-row mt-xs">
                            {appliedRules.map((rule) => (
                              <span key={`${pick.label}-${rule}`} className="chip">
                                {rule}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : null}

                      {pick.reasons && pick.reasons.length > 0 ? (
                        <div>
                          <p className="list-title">추천 근거</p>
                          <ul>
                            {pick.reasons.map((reason) => (
                              <li key={`${pick.label}-${reason}`}>
                                {reason}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null}

                      <div className="grid grid-2">
                        <div>
                          <p className="list-title">장점</p>
                          <ul>
                            {pick.pros.map((pro) => (
                              <li key={`${pick.label}-pro-${pro}`}>{pro}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="list-title">주의할 리스크</p>
                          <ul>
                            {pick.risks.map((risk) => (
                              <li key={`${pick.label}-risk-${risk}`}>{risk}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </>
              );
            })()}
          </article>
        ))}
      </section>
    </>
  );
}
