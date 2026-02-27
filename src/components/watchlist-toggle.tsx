"use client";

import { useState } from "react";

const STORAGE_KEY = "whyssum:watchlist";

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
}

type WatchlistToggleProps = {
  itemKey: string;
  label: string;
};

export default function WatchlistToggle({ itemKey, label }: WatchlistToggleProps) {
  const [saved, setSaved] = useState<boolean>(() => readWatchlist().includes(itemKey));

  const toggle = () => {
    const list = readWatchlist();
    if (list.includes(itemKey)) {
      const next = list.filter((item) => item !== itemKey);
      writeWatchlist(next);
      setSaved(false);
      return;
    }

    const next = Array.from(new Set([...list, itemKey]));
    writeWatchlist(next);
    setSaved(true);
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
