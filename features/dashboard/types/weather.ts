import type { WeatherConditionKey } from "@/features/dashboard/domain/weather";

import type { DashboardWeather } from "./dashboard";

export interface DashboardWeatherLabels {
  eyebrow: string;
  title: string;
  locationLabel: string;
  feelsLike: string;
  precipitation: string;
  wind: string;
  updated: string;
  unavailableTitle: string;
  unavailableDescription: string;
}

export type DashboardWeatherConditionLabels = Record<
  WeatherConditionKey,
  string
>;

export type AvailableDashboardWeather = Extract<
  DashboardWeather,
  { status: "available" }
>;
