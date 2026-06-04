"use client";

import type {
  DashboardWeatherConditionLabels,
  DashboardWeatherLabels,
} from "@/features/dashboard/types/weather";
import { useClientWeather } from "@/features/dashboard/hooks/useClientWeather";
import { Surface } from "@/shared/ui/Surface";

import { DashboardWeatherCard } from "./DashboardWeatherCard";

interface ClientWeatherCardProps {
  labels: DashboardWeatherLabels;
  conditionLabels: DashboardWeatherConditionLabels;
}

export function ClientWeatherCard({ labels, conditionLabels }: ClientWeatherCardProps) {
  const weather = useClientWeather();

  if (weather === null) {
    return (
      <Surface className="p-4">
        <div className="h-[180px] animate-pulse rounded-lg bg-stone-100" />
      </Surface>
    );
  }

  return (
    <DashboardWeatherCard
      weather={weather}
      labels={labels}
      conditionLabels={conditionLabels}
    />
  );
}
