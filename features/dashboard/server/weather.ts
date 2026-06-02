import "server-only";

import { z } from "zod";

import { createE2EMockWeather } from "@/lib/e2e/mock-data";
import { isE2EMockModeEnabled } from "@/lib/e2e/mock-mode";
import type { DashboardWeather } from "@/features/dashboard/types/dashboard";

const OPEN_METEO_FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const WEATHER_CACHE_SECONDS = 15 * 60;
const WEATHER_REQUEST_TIMEOUT_MS = 4000;
const WEATHER_COORDINATE_PRECISION = 2;
const OKNA_TOWN_WEATHER_LOCATION: CottageWeatherLocation = {
  latitude: 50.5275,
  longitude: 14.6711,
};

const openMeteoCurrentWeatherSchema = z.object({
  current: z.object({
    apparent_temperature: z.number(),
    precipitation: z.number(),
    temperature_2m: z.number(),
    time: z.string(),
    weather_code: z.number(),
    wind_speed_10m: z.number(),
  }),
});

interface CottageWeatherLocation {
  latitude: number;
  longitude: number;
}

function parseCoordinate(
  value: string | undefined,
  range: { min: number; max: number },
): number | null {
  if (!value) {
    return null;
  }

  const coordinate = Number(value);
  if (
    !Number.isFinite(coordinate) ||
    coordinate < range.min ||
    coordinate > range.max
  ) {
    return null;
  }

  return coordinate;
}

function getConfiguredCottageWeatherLocation(): CottageWeatherLocation {
  const latitude = parseCoordinate(process.env.COTTAGE_WEATHER_LATITUDE, {
    min: -90,
    max: 90,
  });
  const longitude = parseCoordinate(process.env.COTTAGE_WEATHER_LONGITUDE, {
    min: -180,
    max: 180,
  });

  if (latitude === null || longitude === null) {
    return OKNA_TOWN_WEATHER_LOCATION;
  }

  return {
    latitude,
    longitude,
  };
}

function roundCoordinate(coordinate: number): number {
  return Number(coordinate.toFixed(WEATHER_COORDINATE_PRECISION));
}

function buildWeatherUrl(location: CottageWeatherLocation): string {
  const url = new URL(OPEN_METEO_FORECAST_URL);
  const roundedLatitude = roundCoordinate(location.latitude);
  const roundedLongitude = roundCoordinate(location.longitude);

  url.searchParams.set("latitude", String(roundedLatitude));
  url.searchParams.set("longitude", String(roundedLongitude));
  url.searchParams.set(
    "current",
    [
      "temperature_2m",
      "apparent_temperature",
      "precipitation",
      "weather_code",
      "wind_speed_10m",
    ].join(","),
  );
  url.searchParams.set("timezone", "auto");
  url.searchParams.set("forecast_days", "1");

  return url.toString();
}

function roundMetric(value: number, fractionDigits = 0): number {
  return Number(value.toFixed(fractionDigits));
}

export async function getCurrentCottageWeather(): Promise<DashboardWeather> {
  if (isE2EMockModeEnabled()) {
    return createE2EMockWeather();
  }

  const location = getConfiguredCottageWeatherLocation();

  try {
    const response = await fetch(buildWeatherUrl(location), {
      next: { revalidate: WEATHER_CACHE_SECONDS },
      signal: AbortSignal.timeout(WEATHER_REQUEST_TIMEOUT_MS),
    });

    if (!response.ok) {
      return { status: "unavailable" };
    }

    const payload = openMeteoCurrentWeatherSchema.parse(await response.json());
    const current = payload.current;

    return {
      status: "available",
      apparentTemperatureC: roundMetric(current.apparent_temperature),
      observedAt: current.time,
      precipitationMm: roundMetric(current.precipitation, 1),
      temperatureC: roundMetric(current.temperature_2m),
      weatherCode: current.weather_code,
      windSpeedKmh: roundMetric(current.wind_speed_10m),
    };
  } catch {
    return { status: "unavailable" };
  }
}
