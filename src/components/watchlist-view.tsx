"use client";

import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";

const STORAGE_KEY = "whyssum:watchlist";
const WATCHLIST_CHANGED_EVENT = "whyssum:watchlist-changed";

function readWatchlist(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function writeWatchlist(items: string[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(WATCHLIST_CHANGED_EVENT));
}

function subscribeWatchlist(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handler = () => onStoreChange();
  window.addEventListener("storage", handler);
  window.addEventListener(WATCHLIST_CHANGED_EVENT, handler);
  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener(WATCHLIST_CHANGED_EVENT, handler);
  };
}

function getWatchlistSnapshot() {
  return readWatchlist();
}

function getWatchlistServerSnapshot() {
  return [] as string[];
}

export default function WatchlistView() {
  const items = useSyncExternalStore(subscribeWatchlist, getWatchlistSnapshot, getWatchlistServerSnapshot);

  const parsedItems = useMemo(
    () =>
      items.map((item) => {
        const [role, ...toolTokens] = item.split(":");
        return {
          key: item,
          role,
          tool: toolTokens.join(":") || item,
        };
      }),
    [items],
  );

  const removeItem = (key: string) => {
    const next = items.filter((item) => item !== key);
    writeWatchlist(next);
  };

  if (parsedItems.length === 0) {
    return (
      <section className="card">
        <h2>아직 저장된 항목이 없습니다</h2>
        <p className="muted">트렌드/비교 화면에서 &quot;관심&quot; 버튼을 눌러 저장해보세요.</p>
        <div className="button-row">
          <Link href="/trends/backend" className="button button-primary">
            트렌드 보러가기
          </Link>
          <Link href="/compare" className="button button-ghost">
            비교 보러가기
          </Link>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="card">
        <div className="split-note">
          <div>
            <h2>저장 항목 {parsedItems.length}개</h2>
            <p className="muted">브라우저 로컬 저장소 기준으로 관리됩니다.</p>
          </div>
          <button
            type="button"
            className="button button-ghost"
            onClick={() => {
              writeWatchlist([]);
            }}
          >
            전체 삭제
          </button>
        </div>
      </section>

      <section className="grid grid-3">
        {parsedItems.map((item) => (
          <article className="card" key={item.key}>
            <p className="eyebrow">{item.role}</p>
            <h2>{item.tool}</h2>
            <div className="button-row">
              <Link href={`/trends/${item.role}`} className="button button-primary">
                트렌드 보기
              </Link>
              <button type="button" className="button button-ghost" onClick={() => removeItem(item.key)}>
                삭제
              </button>
            </div>
          </article>
        ))}
      </section>
    </>
  );
}
