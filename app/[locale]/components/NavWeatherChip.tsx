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
    "inline-flex items-center gap-1.5 rounded-xl bg-zinc-100/95 text-zinc-700 ring-1 ring-white/80 shadow-[0_12px_24px_-20px_rgba(24,24,27,0.28)] text-xs font-semibold",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span
      className={chipClassName}
      aria-label={ariaLabel ?? `${weather.temperatureC}°C`}
    >
      <CloudSun className="h-3.5 w-3.5 shrink-0 text-sky-500" aria-hidden="true" />
      <span className="text-zinc-800" aria-hidden="true">
        {weather.temperatureC}°C
      </span>
    </span>
  );
}
