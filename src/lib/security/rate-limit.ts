/** 요청 횟수와 윈도우 리셋 시각을 담는 버킷 */
type Bucket = {
  count: number;
  resetAt: number;
};

/** 체크 시 사용할 제한 횟수·윈도우(ms) */
type RateLimitOptions = {
  limit: number;
  windowMs: number;
};

/** checkRateLimit 반환값 (허용 여부·잔여 횟수·리셋 시각) */
type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

/**
 * 만료된 키를 정리하는 함수
 * @param now 현재 시간
 */
function cleanupExpired(now: number) {
  for (const [key, bucket] of buckets.entries()) {
    if (bucket.resetAt <= now) {
      buckets.delete(key);
    }
  }
}

/**
 * 메모리 버킷 기반으로 요청 제한 가능 여부와 남은 횟수를 계산한다.
 * @param key 제한을 적용할 식별 키
 * @param options 제한 횟수/윈도우 설정
 * @returns 허용 여부와 잔여 횟수, 리셋 시각
 */
export function checkRateLimit(key: string, options: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  cleanupExpired(now);

  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    const next: Bucket = { count: 1, resetAt: now + options.windowMs };
    buckets.set(key, next);
    return { allowed: true, remaining: options.limit - 1, resetAt: next.resetAt };
  }

  const nextCount = existing.count + 1;
  existing.count = nextCount;
  buckets.set(key, existing);

  return {
    allowed: nextCount <= options.limit,
    remaining: Math.max(0, options.limit - nextCount),
    resetAt: existing.resetAt,
  };
}

/**
 * 전달받은 IP 값을 정규화해 비어 있으면 unknown으로 대체한다.
 * @param ip 원본 IP 문자열
 * @returns 정규화된 IP 키
 */
export function getClientIp(ip: string | null): string {
  return ip?.trim() || "unknown";
}
