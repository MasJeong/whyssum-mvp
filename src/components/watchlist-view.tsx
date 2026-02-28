"use client";

import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";

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
 * 저장소 변경 이벤트를 구독해 목록 렌더를 동기화한다.
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
 * 클라이언트 관심리스트 스냅샷을 안정적으로 반환한다.
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
 * 서버 렌더링 기본 스냅샷을 반환한다.
 * @returns 빈 관심리스트
 */
function getWatchlistServerSnapshot() {
  return [] as string[];
}

/**
 * 저장된 관심 도구 목록을 조회/삭제할 수 있는 화면 컴포넌트다.
 * @returns 관심리스트 UI
 */
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

  /**
   * 특정 항목을 관심리스트에서 제거한다.
   * @param key 삭제할 저장 키
   * @returns 없음
   */
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
