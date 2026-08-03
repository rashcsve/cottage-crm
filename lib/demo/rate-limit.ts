interface RateLimiter {
  isRateLimited(key: string): boolean;
}

export function createRateLimiter(
  windowMs: number,
  maxRequests: number,
): RateLimiter {
  const requestsByKey = new Map<string, { count: number; windowStart: number }>();

  return {
    isRateLimited(key: string): boolean {
      const now = Date.now();
      const entry = requestsByKey.get(key);

      if (!entry || now - entry.windowStart >= windowMs) {
        requestsByKey.set(key, { count: 1, windowStart: now });
        return false;
      }

      entry.count += 1;
      return entry.count > maxRequests;
    },
  };
}

const DEMO_SESSION_WINDOW_MS = 60_000;
const DEMO_SESSION_MAX_REQUESTS = 5;

export const demoSessionRateLimiter = createRateLimiter(
  DEMO_SESSION_WINDOW_MS,
  DEMO_SESSION_MAX_REQUESTS,
);
