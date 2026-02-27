"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { BriefingItem } from "@/lib/briefing-data";

type ApiResponse = {
  items: BriefingItem[];
  count: number;
  fetchedAt: string;
  error?: string;
};

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

export default function BriefingBoard() {
  const [role, setRole] = useState("all");
  const [impact, setImpact] = useState("all");
  const [periodDays, setPeriodDays] = useState(30);
  const [items, setItems] = useState<BriefingItem[]>([]);
  const [fetchedAt, setFetchedAt] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

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
      } catch (fetchError) {
        if (!active) return;
        setError(fetchError instanceof Error ? fetchError.message : "알 수 없는 오류가 발생했습니다.");
        setItems([]);
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

  return (
    <>
      <section className="card">
        <p className="eyebrow">필터</p>
        <div className="filter-grid">
          <label className="field">
            <span>직무</span>
            <select value={role} onChange={(event) => setRole(event.target.value)}>
              {roleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>영향도</span>
            <select value={impact} onChange={(event) => setImpact(event.target.value)}>
              {impactOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>기간</span>
            <select value={periodDays} onChange={(event) => setPeriodDays(Number(event.target.value))}>
              {periodOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <p className="inline-note" style={{ marginTop: "0.55rem" }}>
          {loading ? "업데이트 중..." : `마지막 조회: ${fetchedLabel}`}
        </p>
        {error ? <p className="error-text">{error}</p> : null}
      </section>

      {items.length === 0 ? (
        <section className="card">
          <h2>조건에 맞는 브리핑이 없습니다</h2>
          <p className="muted">필터를 완화하거나 기간을 늘려 다시 확인해보세요.</p>
        </section>
      ) : (
        <section className="grid grid-2">
          {items.map((item) => (
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
              <p className="inline-note" style={{ marginTop: "0.5rem" }}>
                출처: {item.sourceName} · {new Date(item.publishedAt).toLocaleDateString("ko-KR")}
              </p>
              <div className="button-row">
                <a href={item.sourceUrl} target="_blank" rel="noreferrer" className="button button-ghost">
                  원문 보기
                </a>
                <Link href={item.role === "all" ? "/trends/backend" : `/trends/${item.role}`} className="button button-ghost">
                  트렌드
                </Link>
                <Link href="/compare" className="button button-ghost">
                  비교
                </Link>
                <Link href={routeByRole[item.role] ?? "/scenarios/backend"} className="button button-primary">
                  상황추천
                </Link>
              </div>
            </article>
          ))}
        </section>
      )}
    </>
  );
}
