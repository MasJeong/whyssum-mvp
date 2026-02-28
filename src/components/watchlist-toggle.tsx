"use client";

import { useSyncExternalStore } from "react";

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

type WatchlistToggleProps = {
  itemKey: string;
  label: string;
};

export default function WatchlistToggle({ itemKey, label }: WatchlistToggleProps) {
  const watchlist = useSyncExternalStore(subscribeWatchlist, getWatchlistSnapshot, getWatchlistServerSnapshot);
  const saved = watchlist.includes(itemKey);

  const toggle = () => {
    if (watchlist.includes(itemKey)) {
      const next = watchlist.filter((item) => item !== itemKey);
      writeWatchlist(next);
      return;
    }

    const next = Array.from(new Set([...watchlist, itemKey]));
    writeWatchlist(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className={`watch-toggle ${saved ? "watch-on" : ""}`}
      aria-label={`${label} 관심리스트 ${saved ? "해제" : "추가"}`}
    >
      {saved ? "저장됨" : "관심"}
    </button>
  );
}
