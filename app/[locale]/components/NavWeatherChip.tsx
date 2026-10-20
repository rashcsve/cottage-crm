import { CloudSun } from "lucide-react";

import type { DashboardWeather } from "@/features/dashboard/types/dashboard";

interface NavWeatherChipProps {
  weather: DashboardWeather;
  ariaLabel?: string;
  className?: string;
}

export function NavWeatherChip({
  weather,
  ariaLabel,
  className = "",
}: NavWeatherChipProps) {
  if (weather.status !== "available") return null;

  const chipClassName = [
    "inline-flex items-center gap-1.5 px-1 text-xs text-ink-secondary",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span
      role="img"
      className={chipClassName}
      aria-label={ariaLabel ?? `${weather.temperatureC}°C`}
    >
      <CloudSun className="size-4 shrink-0" aria-hidden="true" />
      <span className="font-mono font-medium tracking-data" aria-hidden="true">
        {weather.temperatureC}°C
      </span>
    </span>
  );
}
