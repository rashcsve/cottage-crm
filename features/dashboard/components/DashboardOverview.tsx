import { WEATHER_CONDITION_KEYS, type WeatherConditionKey } from "@/features/dashboard/domain/weather";
import { ClientWeatherCard } from "@/features/dashboard/components/ClientWeatherCard";
import { DashboardPresenceSection } from "@/features/dashboard/components/DashboardPresenceSection";
import { DashboardStatsSection } from "@/features/dashboard/components/DashboardStatsSection";
import type { DashboardBulkSectionData, DashboardVisitOverview } from "@/features/dashboard/types/dashboard";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { Surface } from "@/shared/ui/Surface";

interface DashboardOverviewProps {
  visitsPromise: Promise<DashboardVisitOverview>;
  bulkPromise: Promise<DashboardBulkSectionData>;
  todayIso: string;
  locale: string;
}

function PresenceSkeleton() {
  return (
    <Surface className="animate-skeleton-appear overflow-hidden">
      <div className="px-4 py-3.5">
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1.5">
            <div className="h-3 w-40 animate-pulse rounded-lg bg-stone-100" />
            <div className="h-6 w-48 animate-pulse rounded-lg bg-stone-100" />
            <div className="h-4 w-72 animate-pulse rounded-lg bg-stone-100" />
          </div>
          <div className="h-6 w-20 animate-pulse rounded-full bg-stone-100" />
        </div>
      </div>
      <div className="border-t border-stone-200 px-4 py-3.5 space-y-2">
        <div className="h-5 w-56 animate-pulse rounded-lg bg-stone-100" />
        <div className="h-4 w-36 animate-pulse rounded-lg bg-stone-100" />
      </div>
    </Surface>
  );
}

function StatsSkeleton() {
  return (
    <div className="animate-skeleton-appear space-y-4">
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-2xl border border-stone-200 bg-white p-3.5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1.5">
                <div className="h-3 w-16 animate-pulse rounded-lg bg-stone-100" />
                <div className="h-7 w-10 animate-pulse rounded-lg bg-stone-100" />
              </div>
              <div className="h-9 w-9 animate-pulse rounded-xl bg-stone-100" />
            </div>
            <div className="mt-2 h-4 w-full animate-pulse rounded-lg bg-stone-100" />
          </div>
        ))}
      </section>

      <section className="grid items-start gap-2.5 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Surface key={i} className="p-3 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="h-2.5 w-16 animate-pulse rounded-full bg-stone-100" />
                <div className="h-4 w-28 animate-pulse rounded-lg bg-stone-100" />
              </div>
              <div className="h-5 w-8 animate-pulse rounded-full bg-stone-100" />
            </div>
            <div className="divide-y divide-stone-200">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="py-1 first:pt-0 last:pb-0 space-y-1">
                  <div className="h-4 w-full animate-pulse rounded-lg bg-stone-100" />
                  <div className="h-3 w-3/4 animate-pulse rounded-lg bg-stone-100" />
                </div>
              ))}
            </div>
            <div className="h-4 w-24 animate-pulse rounded-lg bg-stone-100" />
          </Surface>
        ))}
      </section>
    </div>
  );
}

export async function DashboardOverview({
  visitsPromise,
  bulkPromise,
  todayIso,
  locale,
}: DashboardOverviewProps) {
  const t = await getTranslations("dashboard.overview");

  const weatherConditionLabels = Object.fromEntries(
    WEATHER_CONDITION_KEYS.map((key) => [key, t(`weather.conditions.${key}`)])
  ) as Record<WeatherConditionKey, string>;

  const weatherLabels = {
    eyebrow: t("weather.eyebrow"),
    title: t("weather.title"),
    locationLabel: t("weather.locationLabel"),
    feelsLike: t("weather.feelsLike"),
    precipitation: t("weather.precipitation"),
    wind: t("weather.wind"),
    updated: t("weather.updated"),
    unavailableTitle: t("weather.unavailableTitle"),
    unavailableDescription: t("weather.unavailableDescription"),
  };

  return (
    <div className="space-y-4">
      <section className="grid gap-3 lg:grid-cols-[minmax(0,1.45fr)_minmax(18rem,0.75fr)]">
        <Suspense fallback={<PresenceSkeleton />}>
          <DashboardPresenceSection
            visitsPromise={visitsPromise}
            todayIso={todayIso}
            locale={locale}
          />
        </Suspense>

        <ClientWeatherCard
          labels={weatherLabels}
          conditionLabels={weatherConditionLabels}
        />
      </section>

      <Suspense fallback={<StatsSkeleton />}>
        <DashboardStatsSection
          visitsPromise={visitsPromise}
          bulkPromise={bulkPromise}
          locale={locale}
        />
      </Suspense>
    </div>
  );
}
