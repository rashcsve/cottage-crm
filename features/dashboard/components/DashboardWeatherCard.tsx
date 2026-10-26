import { getWeatherConditionKey } from "@/features/dashboard/domain/weather";
import type { DashboardWeather } from "@/features/dashboard/types/dashboard";
import type {
  DashboardWeatherConditionLabels,
  DashboardWeatherLabels,
} from "@/features/dashboard/types/weather";
import { EmptyState } from "@/shared/ui/EmptyState";
import { Surface } from "@/shared/ui/Surface";

interface DashboardWeatherCardProps {
  conditionLabels: DashboardWeatherConditionLabels;
  labels: DashboardWeatherLabels;
  locale: string;
  weather: DashboardWeather;
}

const LOCAL_DATE_TIME_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/;

function formatWeatherTime(value: string, locale: string): string {
  const localDateTime = value.match(LOCAL_DATE_TIME_PATTERN)?.[0];
  const date = localDateTime ? new Date(`${localDateTime}Z`) : null;

  if (!date || Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(locale, {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(date);
}

function formatUnit(
  locale: string,
  unit: string,
  value: number,
  unitDisplay: "short" | "narrow" = "short",
): string {
  return new Intl.NumberFormat(locale, {
    style: "unit",
    unit,
    unitDisplay,
  }).format(value);
}

function Reading({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-ink-muted">{label}</dt>
      <dd className="mt-1 font-mono text-sm text-ink-primary">{value}</dd>
    </div>
  );
}

export function DashboardWeatherCard({
  conditionLabels,
  labels,
  locale,
  weather,
}: DashboardWeatherCardProps) {
  return (
    <Surface as="section" padding="default" aria-labelledby="dashboard-weather-title">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h2
          id="dashboard-weather-title"
          className="text-xs font-semibold text-ink-muted"
        >
          {labels.title}
        </h2>
        <p className="flex flex-wrap gap-x-3 text-xs text-ink-muted">
          <span>{labels.locationLabel}</span>
          {weather.status === "available" ? (
            <span>
              {labels.updated}{" "}
              <time dateTime={weather.observedAt} className="font-mono">
                {formatWeatherTime(weather.observedAt, locale)}
              </time>
            </span>
          ) : null}
        </p>
      </div>

      {weather.status === "available" ? (
        <>
          <div className="mt-2 flex items-end justify-between gap-3 border-b border-border pb-3">
            <p className="font-mono text-5xl font-semibold leading-none tracking-data text-ink-primary">
              {formatUnit(locale, "celsius", weather.temperatureC)}
            </p>
            <p className="text-right text-sm font-semibold text-ink-secondary">
              {conditionLabels[getWeatherConditionKey(weather.weatherCode)]}
            </p>
          </div>

          <dl className="mt-3 grid grid-cols-3 gap-3">
            <Reading
              label={labels.wind}
              value={formatUnit(locale, "kilometer-per-hour", weather.windSpeedKmh)}
            />
            <Reading
              label={labels.precipitation}
              value={formatUnit(locale, "millimeter", weather.precipitationMm)}
            />
            <Reading
              label={labels.feelsLike}
              value={formatUnit(locale, "celsius", weather.apparentTemperatureC)}
            />
          </dl>
        </>
      ) : (
        <EmptyState
          title={labels.unavailableTitle}
          description={labels.unavailableDescription}
        />
      )}
    </Surface>
  );
}
