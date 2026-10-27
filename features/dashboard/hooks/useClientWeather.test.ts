import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";

import type { DashboardWeather } from "@/features/dashboard/types/dashboard";

const weather: DashboardWeather = {
  status: "available",
  apparentTemperatureC: 15,
  observedAt: "2026-05-05T09:00",
  precipitationMm: 0,
  temperatureC: 16,
  weatherCode: 1,
  windSpeedKmh: 10,
};

async function loadHook() {
  vi.resetModules();
  const { useClientWeather } = await import("./useClientWeather");
  return useClientWeather;
}

describe("useClientWeather", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve(new Response(JSON.stringify(weather), { status: 200 }))
      )
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns null on first render, then the fetched weather", async () => {
    const useClientWeather = await loadHook();
    const firstValues: Array<DashboardWeather | null> = [];

    const { result } = renderHook(() => {
      const value = useClientWeather();
      if (firstValues.length === 0) firstValues.push(value);
      return value;
    });

    expect(firstValues[0]).toBeNull();
    await waitFor(() => expect(result.current).toEqual(weather));
  });

  it("still returns null on first render when weather is already cached, to match the server HTML", async () => {
    const useClientWeather = await loadHook();

    const warmUp = renderHook(() => useClientWeather());
    await waitFor(() => expect(warmUp.result.current).toEqual(weather));
    warmUp.unmount();

    const firstValues: Array<DashboardWeather | null> = [];
    const { result } = renderHook(() => {
      const value = useClientWeather();
      if (firstValues.length === 0) firstValues.push(value);
      return value;
    });

    expect(firstValues[0]).toBeNull();
    await waitFor(() => expect(result.current).toEqual(weather));
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
