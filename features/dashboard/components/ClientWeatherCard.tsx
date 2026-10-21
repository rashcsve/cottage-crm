"use client";

import type {
  DashboardWeatherConditionLabels,
  DashboardWeatherLabels,
} from "@/features/dashboard/types/weather";
import { useClientWeather } from "@/features/dashboard/hooks/useClientWeather";

import { WeatherSkeleton } from "./DashboardSkeletons";
import { DashboardWeatherCard } from "./DashboardWeatherCard";

interface ClientWeatherCardProps {
  labels: DashboardWeatherLabels;
  conditionLabels: DashboardWeatherConditionLabels;
  locale: string;
}

export function ClientWeatherCard({
  labels,
  conditionLabels,
  locale,
}: ClientWeatherCardProps) {
  const weather = useClientWeather();

  if (weather === null) {
    return <WeatherSkeleton />;
  }

  return (
    <DashboardWeatherCard
      weather={weather}
      labels={labels}
      conditionLabels={conditionLabels}
      locale={locale}
    />
  );
}
