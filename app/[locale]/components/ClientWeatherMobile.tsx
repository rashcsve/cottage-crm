"use client";

import { useTranslations } from "next-intl";

import { useClientWeather } from "@/features/dashboard/hooks/useClientWeather";

export function ClientWeatherMobile() {
  const t = useTranslations("appShell");
  const weather = useClientWeather();

  if (weather?.status !== "available") return null;

  return (
    <span
      className="shrink-0"
      aria-label={t("weatherLabel", { temperature: weather.temperatureC })}
    >
      <span aria-hidden="true">· {weather.temperatureC}°C</span>
    </span>
  );
}
