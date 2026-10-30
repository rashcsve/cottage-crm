import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

import { WEATHER_CONDITION_KEYS, type WeatherConditionKey } from "@/features/dashboard/domain/weather";
import { ClientWeatherCard } from "@/features/dashboard/components/ClientWeatherCard";
import {
  PresenceSkeleton,
  PreviewSectionSkeleton,
} from "@/features/dashboard/components/DashboardSkeletons";
import { DashboardPresenceSection } from "@/features/dashboard/components/DashboardPresenceSection";
import { DashboardPreviewSection } from "@/features/dashboard/components/DashboardPreviewSection";
import type { DashboardBulkSectionData, DashboardVisitOverview } from "@/features/dashboard/types/dashboard";
import { Link } from "@/i18n/navigation";
import { dashboardRoutes } from "@/lib/routes";
import { buttonVariants } from "@/shared/ui/Button";
import { MobileActionBar } from "@/shared/ui/MobileActionBar";

interface DashboardOverviewProps {
  visitsPromise: Promise<DashboardVisitOverview>;
  bulkPromise: Promise<DashboardBulkSectionData>;
  locale: string;
  todayIso: string;
}

export async function DashboardOverview({
  visitsPromise,
  bulkPromise,
  locale,
  todayIso,
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
    compactWind: t("weather.compactWind"),
    updated: t("weather.updated"),
    unavailableTitle: t("weather.unavailableTitle"),
    unavailableDescription: t("weather.unavailableDescription"),
  };

  const planVisitLink = (
    <Link
      href={dashboardRoutes.visits}
      className={buttonVariants("primary", "min-h-12 w-full justify-between!")}
    >
      {t("planVisit")}
      <ArrowRight aria-hidden="true" className="size-4 shrink-0" />
    </Link>
  );

  return (
    <>
      <div className="flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:gap-6">
        <div className="contents lg:flex lg:min-w-0 lg:shrink lg:grow lg:basis-85 lg:flex-col lg:gap-6">
          <Suspense fallback={<PresenceSkeleton />}>
            <DashboardPresenceSection
              visitsPromise={visitsPromise}
              locale={locale}
              todayIso={todayIso}
            />
          </Suspense>

          <div className="hidden lg:block">{planVisitLink}</div>

          <div className="order-last lg:order-none">
            <ClientWeatherCard
              labels={weatherLabels}
              conditionLabels={weatherConditionLabels}
              locale={locale}
            />
          </div>
        </div>

        <div className="min-w-0 lg:shrink lg:grow-2 lg:basis-140">
          <Suspense fallback={<PreviewSectionSkeleton />}>
            <DashboardPreviewSection bulkPromise={bulkPromise} locale={locale} />
          </Suspense>
        </div>
      </div>

      <MobileActionBar>{planVisitLink}</MobileActionBar>
    </>
  );
}
