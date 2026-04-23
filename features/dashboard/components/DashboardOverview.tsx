import {
  CalendarRange,
  ListTodo,
  NotebookPen,
  ShoppingCart,
  type LucideIcon,
} from "lucide-react";
import { getTranslations } from "next-intl/server";

import { DashboardPresenceCard } from "@/features/dashboard/components/DashboardPresenceCard";
import { DashboardPreviewCards } from "@/features/dashboard/components/DashboardPreviewCards";
import { DashboardSummaryCard } from "@/features/dashboard/components/DashboardSummaryCard";
import { DashboardWeatherCard } from "@/features/dashboard/components/DashboardWeatherCard";
import type { DashboardAccent } from "@/features/dashboard/components/dashboardAccentStyles";
import {
  WEATHER_CONDITION_KEYS,
  type WeatherConditionKey,
} from "@/features/dashboard/domain/weather";
import type { DashboardOverviewData } from "@/features/dashboard/types/dashboard";
import { dashboardRoutes } from "@/lib/routes";

interface DashboardOverviewProps {
  data: DashboardOverviewData;
  locale: string;
}

interface SummaryCardConfig {
  description: string;
  href: string;
  icon: LucideIcon;
  id: DashboardAccent;
  label: string;
  value: number;
}

export async function DashboardOverview({
  data,
  locale,
}: DashboardOverviewProps) {
  const [t, tNavigation] = await Promise.all([
    getTranslations("dashboard.overview"),
    getTranslations("navigation"),
  ]);

  const hasCurrentVisits = data.visits.currentCount > 0;
  const hasNextVisit = Boolean(data.visits.nextVisit);
  const visitTone = hasCurrentVisits ? "success" : "neutral";

  const weatherConditionLabels = Object.fromEntries(
    WEATHER_CONDITION_KEYS.map((key) => [key, t(`weather.conditions.${key}`)])
  ) as Record<WeatherConditionKey, string>;

  const summaryCards: SummaryCardConfig[] = [
    {
      description: t("summary.visits", {
        count: data.visits.currentCount,
      }),
      href: dashboardRoutes.visits,
      icon: CalendarRange,
      id: "visits",
      label: tNavigation("visits"),
      value: data.visits.upcomingCount,
    },
    {
      description: t("summary.tasks", {
        count: data.tasks.overdueCount,
      }),
      href: dashboardRoutes.tasks,
      icon: ListTodo,
      id: "tasks",
      label: tNavigation("tasks"),
      value: data.tasks.openCount,
    },
    {
      description: t("summary.shopping", {
        count: data.shopping.pendingCount,
      }),
      href: dashboardRoutes.shopping,
      icon: ShoppingCart,
      id: "shopping",
      label: tNavigation("shopping"),
      value: data.shopping.pendingCount,
    },
    {
      description: t("summary.notes"),
      href: dashboardRoutes.notes,
      icon: NotebookPen,
      id: "notes",
      label: tNavigation("notes"),
      value: data.notes.recentNotes.length,
    },
  ];

  const presenceBadgeLabel = hasCurrentVisits
    ? t("presence.currentBadge", {
        count: data.visits.currentCount,
      })
    : t("presence.emptyBadge");

  const presenceDescription = hasCurrentVisits
    ? t("presence.currentDescription")
    : hasNextVisit
    ? t("presence.nextDescription")
    : t("presence.emptyDescription");

  const presenceTitle = hasCurrentVisits
    ? t("presence.currentTitle")
    : t("presence.emptyTitle");

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
    <div className="space-y-5 sm:space-y-6">
      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.45fr)_minmax(19rem,0.75fr)]">
        <DashboardPresenceCard
          badgeLabel={presenceBadgeLabel}
          currentVisits={data.visits.currentVisits}
          description={presenceDescription}
          emptyDescription={t("presence.noVisitDescription")}
          emptyTitle={t("presence.noVisitTitle")}
          locale={locale}
          nextVisit={data.visits.nextVisit}
          nextVisitLabel={t("presence.nextVisitLabel")}
          title={presenceTitle}
          todayIso={data.todayIso}
          tone={visitTone}
        />

        <DashboardWeatherCard
          conditionLabels={weatherConditionLabels}
          labels={weatherLabels}
          weather={data.weather}
        />
      </section>

      <section
        aria-label={t("summary.ariaLabel")}
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {summaryCards.map(({ id, ...card }) => (
          <DashboardSummaryCard key={id} accent={id} {...card} />
        ))}
      </section>

      <DashboardPreviewCards data={data} locale={locale} />
    </div>
  );
}
