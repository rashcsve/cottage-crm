import { afterEach, describe, expect, it, vi } from "vitest";

import { getCurrentCottageWeather } from "@/features/dashboard/server/weather";

describe("getCurrentCottageWeather", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  function mockWeatherResponse() {
    return vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          current: {
            apparent_temperature: 7.7,
            precipitation: 0.04,
            temperature_2m: 8.2,
            time: "2026-04-23T10:15",
            weather_code: 3,
            wind_speed_10m: 12.4,
          },
        }),
        { status: 200 },
      ),
    );
  }

  it("uses the town-level fallback when private coordinates are missing", async () => {
    const fetchSpy = mockWeatherResponse();

    await expect(getCurrentCottageWeather()).resolves.toMatchObject({
      status: "available",
      temperatureC: 8,
    });

    const requestedUrl = new URL(String(fetchSpy.mock.calls[0][0]));
    expect(requestedUrl.searchParams.get("latitude")).toBe("50.53");
    expect(requestedUrl.searchParams.get("longitude")).toBe("14.67");
  });

  it("rounds private coordinate overrides before requesting current conditions", async () => {
    vi.stubEnv("COTTAGE_WEATHER_LATITUDE", "49.12345");
    vi.stubEnv("COTTAGE_WEATHER_LONGITUDE", "14.98765");
    const fetchSpy = mockWeatherResponse();

    await expect(getCurrentCottageWeather()).resolves.toEqual({
      status: "available",
      apparentTemperatureC: 8,
      observedAt: "2026-04-23T10:15",
      precipitationMm: 0,
      temperatureC: 8,
      weatherCode: 3,
      windSpeedKmh: 12,
    });

    const requestedUrl = new URL(String(fetchSpy.mock.calls[0][0]));
    expect(requestedUrl.searchParams.get("latitude")).toBe("49.12");
    expect(requestedUrl.searchParams.get("longitude")).toBe("14.99");
    expect(requestedUrl.searchParams.get("current")).toContain(
      "temperature_2m",
    );
  });

  it("falls back to the town-level location when private coordinates are out of range", async () => {
    vi.stubEnv("COTTAGE_WEATHER_LATITUDE", "120");
    vi.stubEnv("COTTAGE_WEATHER_LONGITUDE", "14.98765");
    const fetchSpy = mockWeatherResponse();

    await getCurrentCottageWeather();

    const requestedUrl = new URL(String(fetchSpy.mock.calls[0][0]));
    expect(requestedUrl.searchParams.get("latitude")).toBe("50.53");
    expect(requestedUrl.searchParams.get("longitude")).toBe("14.67");
  });

  it("returns unavailable when the weather request fails", async () => {
    vi.stubEnv("COTTAGE_WEATHER_LATITUDE", "49.1");
    vi.stubEnv("COTTAGE_WEATHER_LONGITUDE", "14.9");
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, {
      status: 500,
    }));

    await expect(getCurrentCottageWeather()).resolves.toEqual({
      status: "unavailable",
    });
  });
});
