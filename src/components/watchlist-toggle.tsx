"use client";

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "whyssum:watchlist";
const WATCHLIST_CHANGED_EVENT = "whyssum:watchlist-changed";
let cachedWatchlistRaw: string | null = null;
let cachedWatchlist: string[] = [];

/**
 * 로컬 저장소에서 관심리스트를 읽고 문자열 항목만 안전하게 반환한다.
 * @returns 관심리스트 키 배열
 */
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

/**
 * 관심리스트 배열을 저장하고 동일 탭 갱신 이벤트를 발생시킨다.
 * @param items 저장할 관심리스트 키 목록
 * @returns 없음
 */
function writeWatchlist(items: string[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(WATCHLIST_CHANGED_EVENT));
}

/**
 * 외부 저장소 변경 이벤트를 구독해 컴포넌트 갱신을 연결한다.
 * @param onStoreChange 변경 알림 콜백
 * @returns 구독 해제 함수
 */
function subscribeWatchlist(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  // 저장소 이벤트는 다른 탭 변경을, 사용자 이벤트는 같은 탭 변경을 반영한다.
  const handler = () => onStoreChange();
  window.addEventListener("storage", handler);
  window.addEventListener(WATCHLIST_CHANGED_EVENT, handler);
  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener(WATCHLIST_CHANGED_EVENT, handler);
  };
}

/**
 * 클라이언트 스냅샷을 안정적으로 제공하기 위해 원본 문자열 캐시를 재사용한다.
 * @returns 현재 관심리스트 스냅샷
 */
function getWatchlistSnapshot() {
  if (typeof window === "undefined") return [];

  const raw = window.localStorage.getItem(STORAGE_KEY);
  // 외부 저장소 구독 훅은 안정 스냅샷이 중요하므로 원본 문자열 기준 캐시를 사용한다.
  if (raw === cachedWatchlistRaw) {
    return cachedWatchlist;
  }

  cachedWatchlistRaw = raw;
  cachedWatchlist = readWatchlist();
  return cachedWatchlist;
}

/**
 * 서버 렌더링 시 기본 스냅샷을 반환한다.
 * @returns 빈 관심리스트
 */
function getWatchlistServerSnapshot() {
  return [] as string[];
}

/** 관심리스트 토글 버튼 props */
type WatchlistToggleProps = {
  itemKey: string;
  label: string;
};

/**
 * 개별 도구의 관심리스트 추가/해제를 토글하는 버튼 컴포넌트다.
 * @param itemKey 저장 식별자
 * @param label 접근성 라벨에 사용할 도구명
 * @returns 토글 버튼
 */
export default function WatchlistToggle({ itemKey, label }: WatchlistToggleProps) {
  const watchlist = useSyncExternalStore(subscribeWatchlist, getWatchlistSnapshot, getWatchlistServerSnapshot);
  const saved = watchlist.includes(itemKey);

  /**
   * 현재 저장 상태에 따라 항목을 추가하거나 제거한다.
   * @returns 없음
   */
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
