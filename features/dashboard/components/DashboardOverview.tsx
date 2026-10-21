import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

import { WEATHER_CONDITION_KEYS, type WeatherConditionKey } from "@/features/dashboard/domain/weather";
import { ClientWeatherCard } from "@/features/dashboard/components/ClientWeatherCard";
import {
  PresenceSkeleton,
  StatsSkeleton,
} from "@/features/dashboard/components/DashboardSkeletons";
import { DashboardPresenceSection } from "@/features/dashboard/components/DashboardPresenceSection";
import { DashboardStatsSection } from "@/features/dashboard/components/DashboardStatsSection";
import type { DashboardBulkSectionData, DashboardVisitOverview } from "@/features/dashboard/types/dashboard";
import { Link } from "@/i18n/navigation";
import { dashboardRoutes } from "@/lib/routes";
import { buttonVariants } from "@/shared/ui/Button";

interface DashboardOverviewProps {
  visitsPromise: Promise<DashboardVisitOverview>;
  bulkPromise: Promise<DashboardBulkSectionData>;
  locale: string;
}

export async function DashboardOverview({
  visitsPromise,
  bulkPromise,
  locale,
}: DashboardOverviewProps) {
  const t = await getTranslations("dashboard.overview");

  const weatherConditionLabels = Object.fromEntries(
    WEATHER_CONDITION_KEYS.map((key) => [key, t(`weather.conditions.${key}`)])
  ) as Record<WeatherConditionKey, string>;

  const weatherLabels = {
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
    <div className="flex flex-wrap gap-7 lg:gap-6">
      <div className="flex min-w-0 shrink grow basis-85 flex-col gap-7 lg:gap-6">
        <Suspense fallback={<PresenceSkeleton />}>
          <DashboardPresenceSection visitsPromise={visitsPromise} locale={locale} />
        </Suspense>

        <Link
          href={dashboardRoutes.visits}
          className={buttonVariants("primary", "min-h-12 w-full justify-between!")}
        >
          {t("planVisit")}
          <ArrowRight aria-hidden="true" className="size-4 shrink-0" />
        </Link>

        <ClientWeatherCard
          labels={weatherLabels}
          conditionLabels={weatherConditionLabels}
          locale={locale}
        />
      </div>

      <div className="min-w-0 shrink grow-2 basis-140">
        <Suspense fallback={<StatsSkeleton />}>
          <DashboardStatsSection
            visitsPromise={visitsPromise}
            bulkPromise={bulkPromise}
            locale={locale}
          />
        </Suspense>
      </div>
    </div>
  );
}
