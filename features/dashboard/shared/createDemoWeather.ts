import type { DashboardWeather } from "@/features/dashboard/types/dashboard";

interface CreateDemoWeatherOptions {
  observedAt?: string;
}

export function createDemoWeather({
  observedAt = new Date().toISOString().slice(0, 16),
}: CreateDemoWeatherOptions = {}): DashboardWeather {
  return {
    status: "available",
    apparentTemperatureC: 15,
    observedAt,
    precipitationMm: 0,
    temperatureC: 16,
    weatherCode: 1,
    windSpeedKmh: 10,
  };
}

export function createE2EMockWeather(): DashboardWeather {
  return createDemoWeather({
    observedAt: "2026-05-05T09:00",
  });
}
