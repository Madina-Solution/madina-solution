/**
 * Simple in-memory rate limiter.
 * For production, use Redis or edge middleware.
 */
const store = new Map<string, { count: number; resetAt: number }>();

// Cleanup old entries periodically
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, val] of store) {
      if (val.resetAt < now) store.delete(key);
    }
  }, 60_000);
}

export type RateLimitConfig = {
  windowMs: number;  // time window in ms
  maxRequests: number; // max requests per window
};

export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const key = identifier;
  const entry = store.get(key);

  if (!entry || entry.resetAt < now) {
    const resetAt = now + config.windowMs;
    store.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: config.maxRequests - 1, resetAt };
  }

  if (entry.count >= config.maxRequests) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { allowed: true, remaining: config.maxRequests - entry.count, resetAt: entry.resetAt };
}

/**
 * Standard rate limit configs
 */
export const RATE_LIMITS = {
  auth: { windowMs: 15 * 60 * 1000, maxRequests: 10 },      // 10 per 15 min
  upload: { windowMs: 60 * 1000, maxRequests: 5 },           // 5 per minute
  search: { windowMs: 60 * 1000, maxRequests: 30 },          // 30 per minute
  webhook: { windowMs: 60 * 1000, maxRequests: 100 },        // 100 per minute
  general: { windowMs: 60 * 1000, maxRequests: 60 },         // 60 per minute
} as const;
