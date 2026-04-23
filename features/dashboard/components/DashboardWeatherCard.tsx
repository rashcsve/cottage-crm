import { CloudSun } from "lucide-react";

import { getWeatherConditionKey } from "@/features/dashboard/domain/weather";
import type { DashboardWeather } from "@/features/dashboard/types/dashboard";
import type {
  DashboardWeatherConditionLabels,
  DashboardWeatherLabels,
} from "@/features/dashboard/types/weather";
import { StatusBadge } from "@/shared/ui/StatusBadge";
import { Surface } from "@/shared/ui/Surface";

import { DashboardEmptyState } from "./DashboardEmptyState";

interface DashboardWeatherCardProps {
  conditionLabels: DashboardWeatherConditionLabels;
  labels: DashboardWeatherLabels;
  weather: DashboardWeather;
}

function formatWeatherTime(value: string): string {
  const timePart = value.split("T")[1];

  return timePart?.slice(0, 5) ?? value;
}

export function DashboardWeatherCard({
  conditionLabels,
  labels,
  weather,
}: DashboardWeatherCardProps) {
  return (
    <Surface className="p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">
            {labels.eyebrow}
          </p>
          <h2 className="text-lg font-semibold text-stone-900">
            {labels.title}
          </h2>
          <p className="text-sm text-stone-600">{labels.locationLabel}</p>
        </div>

        <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sky-700 ring-1 ring-sky-100">
          <CloudSun className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>

      {weather.status === "available" ? (
        <div className="mt-6 space-y-5">
          <div className="flex items-end gap-3">
            <p className="text-5xl font-semibold tracking-tight text-stone-950">
              {weather.temperatureC}
              <span className="text-2xl">°C</span>
            </p>

            <StatusBadge tone="neutral" className="mb-1.5">
              {conditionLabels[getWeatherConditionKey(weather.weatherCode)]}
            </StatusBadge>
          </div>

          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-stone-500">{labels.feelsLike}</dt>
              <dd className="mt-1 font-semibold text-stone-900">
                {weather.apparentTemperatureC}°C
              </dd>
            </div>

            <div>
              <dt className="text-stone-500">{labels.precipitation}</dt>
              <dd className="mt-1 font-semibold text-stone-900">
                {weather.precipitationMm} mm
              </dd>
            </div>

            <div>
              <dt className="text-stone-500">{labels.wind}</dt>
              <dd className="mt-1 font-semibold text-stone-900">
                {weather.windSpeedKmh} km/h
              </dd>
            </div>

            <div>
              <dt className="text-stone-500">{labels.updated}</dt>
              <dd className="mt-1 font-semibold text-stone-900">
                <time dateTime={weather.observedAt}>
                  {formatWeatherTime(weather.observedAt)}
                </time>
              </dd>
            </div>
          </dl>
        </div>
      ) : (
        <div className="mt-6">
          <DashboardEmptyState
            title={labels.unavailableTitle}
            description={labels.unavailableDescription}
          />
        </div>
      )}
    </Surface>
  );
}
