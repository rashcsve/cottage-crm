import { getWeatherConditionKey } from "@/features/dashboard/domain/weather";
import type { DashboardWeather } from "@/features/dashboard/types/dashboard";
import type {
  AvailableDashboardWeather,
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

interface WeatherReadingsProps {
  condition: string;
  labels: DashboardWeatherLabels;
  locale: string;
  weather: AvailableDashboardWeather;
}

const LOCAL_DATE_TIME_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/;
const READING_SEPARATOR = " · ";

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

function formatUnit(locale: string, unit: string, value: number): string {
  return new Intl.NumberFormat(locale, {
    style: "unit",
    unit,
    unitDisplay: "short",
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

function CompactWeatherLine({ condition, labels, locale, weather }: WeatherReadingsProps) {
  return (
    <div className="flex items-baseline gap-3 lg:hidden">
      <p className="shrink-0 font-mono text-2xl font-semibold leading-none tracking-data text-ink-primary">
        {formatUnit(locale, "celsius", weather.temperatureC)}
      </p>
      <p className="min-w-0 text-sm text-ink-secondary">
        {[
          condition,
          `${labels.compactWind} ${formatUnit(locale, "kilometer-per-hour", weather.windSpeedKmh)}`,
        ].join(READING_SEPARATOR)}
        {READING_SEPARATOR}
        <span className="sr-only">{labels.precipitation} </span>
        {formatUnit(locale, "millimeter", weather.precipitationMm)}
      </p>
    </div>
  );
}

function FullWeatherReadings({ condition, labels, locale, weather }: WeatherReadingsProps) {
  return (
    <div className="hidden lg:block">
      <div className="mt-2 flex items-end justify-between gap-3 border-b border-border pb-3">
        <p className="font-mono text-5xl font-semibold leading-none tracking-data text-ink-primary">
          {formatUnit(locale, "celsius", weather.temperatureC)}
        </p>
        <p className="text-right text-sm font-semibold text-ink-secondary">
          {condition}
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
    </div>
  );
}

function AvailableWeather({
  conditionLabels,
  labels,
  locale,
  weather,
}: Omit<WeatherReadingsProps, "condition"> & {
  conditionLabels: DashboardWeatherConditionLabels;
}) {
  const condition = conditionLabels[getWeatherConditionKey(weather.weatherCode)];

  return (
    <>
      <CompactWeatherLine condition={condition} labels={labels} locale={locale} weather={weather} />
      <FullWeatherReadings condition={condition} labels={labels} locale={locale} weather={weather} />
    </>
  );
}

export function DashboardWeatherCard({
  conditionLabels,
  labels,
  locale,
  weather,
}: DashboardWeatherCardProps) {
  return (
    <Surface
      as="section"
      className="px-4 py-3 lg:p-6"
      aria-labelledby="dashboard-weather-title"
    >
      <div className="lg:flex lg:flex-wrap lg:items-baseline lg:justify-between lg:gap-x-3 lg:gap-y-1">
        <h2
          id="dashboard-weather-title"
          className="sr-only text-xs font-semibold text-ink-muted lg:not-sr-only"
        >
          {labels.title}
        </h2>
        <p className="hidden flex-wrap gap-x-3 text-xs text-ink-muted lg:flex">
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
        <AvailableWeather
          conditionLabels={conditionLabels}
          labels={labels}
          locale={locale}
          weather={weather}
        />
      ) : (
        <EmptyState
          density="compact"
          className="lg:py-6"
          title={labels.unavailableTitle}
          description={labels.unavailableDescription}
        />
      )}
    </Surface>
  );
}
