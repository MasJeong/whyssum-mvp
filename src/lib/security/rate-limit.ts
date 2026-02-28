type Bucket = {
  count: number;
  resetAt: number;
};

type RateLimitOptions = {
  limit: number;
  windowMs: number;
};

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

export function getClientIp(ip: string | null): string {
  return ip?.trim() || "unknown";
}
