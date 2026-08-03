import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

import { createRateLimiter } from "./rate-limit";

describe("createRateLimiter", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows requests up to the limit within the window", () => {
    const limiter = createRateLimiter(60_000, 3);

    expect(limiter.isRateLimited("ip-1")).toBe(false);
    expect(limiter.isRateLimited("ip-1")).toBe(false);
    expect(limiter.isRateLimited("ip-1")).toBe(false);
  });

  it("blocks requests once the limit is exceeded within the window", () => {
    const limiter = createRateLimiter(60_000, 3);

    limiter.isRateLimited("ip-1");
    limiter.isRateLimited("ip-1");
    limiter.isRateLimited("ip-1");

    expect(limiter.isRateLimited("ip-1")).toBe(true);
  });

  it("tracks separate keys independently", () => {
    const limiter = createRateLimiter(60_000, 1);

    expect(limiter.isRateLimited("ip-1")).toBe(false);
    expect(limiter.isRateLimited("ip-2")).toBe(false);
  });

  it("resets the count once the window elapses", () => {
    const limiter = createRateLimiter(60_000, 1);

    limiter.isRateLimited("ip-1");
    expect(limiter.isRateLimited("ip-1")).toBe(true);

    vi.advanceTimersByTime(60_001);

    expect(limiter.isRateLimited("ip-1")).toBe(false);
  });
});
