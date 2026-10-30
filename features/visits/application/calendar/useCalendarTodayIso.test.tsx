import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useCalendarTodayIso } from "./useCalendarTodayIso";

describe("useCalendarTodayIso", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns the next Prague date at 23:30 UTC in winter", () => {
    vi.setSystemTime(new Date("2026-01-15T23:30:00Z"));

    const { result } = renderHook(() => useCalendarTodayIso("2026-01-15"));

    expect(result.current).toBe("2026-01-16");
  });

  it("returns the next Prague date at 23:30 UTC in summer", () => {
    vi.setSystemTime(new Date("2026-07-15T23:30:00Z"));

    const { result } = renderHook(() => useCalendarTodayIso("2026-07-15"));

    expect(result.current).toBe("2026-07-16");
  });

  it("rolls over to the next Prague date while the page stays open", () => {
    vi.setSystemTime(new Date("2026-01-15T22:30:00Z"));

    const { result } = renderHook(() => useCalendarTodayIso("2026-01-15"));

    expect(result.current).toBe("2026-01-15");

    act(() => {
      vi.advanceTimersByTime(60 * 60 * 1000);
    });

    expect(result.current).toBe("2026-01-16");
  });
});
