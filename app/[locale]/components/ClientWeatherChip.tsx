"use client";

import { useTranslations } from "next-intl";

import { useClientWeather } from "@/features/dashboard/hooks/useClientWeather";

import { NavWeatherChip } from "./NavWeatherChip";

interface ClientWeatherChipProps {
  className?: string;
}

export function ClientWeatherChip({ className = "" }: ClientWeatherChipProps) {
  const t = useTranslations("appShell");
  const weather = useClientWeather();

  if (weather === null) {
    return null;
  }

  const ariaLabel =
    weather.status === "available"
      ? t("weatherLabel", { temperature: weather.temperatureC })
      : undefined;

  return (
    <NavWeatherChip
      weather={weather}
      ariaLabel={ariaLabel}
      className={className}
    />
  );
}
