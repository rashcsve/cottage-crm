import { getTranslations } from "next-intl/server";

import { DashboardPresenceCard } from "@/features/dashboard/components/DashboardPresenceCard";
import type { DashboardVisitOverview } from "@/features/dashboard/types/dashboard";
import { diffDateOnlyInDays, parseDateOnlyUtc } from "@/lib/utils/date";

const PRESENCE_VISITOR_LIMIT = 2;

interface DashboardPresenceSectionProps {
  visitsPromise: Promise<DashboardVisitOverview>;
  locale: string;
  todayIso: string;
}

export async function DashboardPresenceSection({
  visitsPromise,
  locale,
  todayIso,
}: DashboardPresenceSectionProps) {
  const [t, visits] = await Promise.all([
    getTranslations("dashboard.overview"),
    visitsPromise,
  ]);

  const names = new Intl.ListFormat(locale, { type: "conjunction" }).format(
    visits.currentVisits.map((visit) => visit.visitorName),
  );

  const statement =
    visits.currentCount > 0
      ? t("presence.statementPresent", { names })
      : t("presence.statementEmpty");

  const today = new Intl.DateTimeFormat(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(parseDateOnlyUtc(todayIso));

  const [singleStay] =
    visits.currentVisits.length === 1 ? visits.currentVisits : [];
  const nightsLeft = singleStay
    ? diffDateOnlyInDays(todayIso, singleStay.dateTo)
    : 0;
  const stayRemaining = singleStay
    ? nightsLeft > 0
      ? t("presence.nightsLeft", { count: nightsLeft })
      : t("presence.leavingToday")
    : undefined;

  const nextVisitLabel = visits.nextVisit
    ? t("presence.nextVisitIn", {
        relative: new Intl.RelativeTimeFormat(locale, {
          numeric: "auto",
        }).format(diffDateOnlyInDays(todayIso, visits.nextVisit.dateFrom), "day"),
      })
    : "";

  const hiddenVisitorCount =
    visits.currentVisits.length - PRESENCE_VISITOR_LIMIT;

  return (
    <DashboardPresenceCard
      currentVisits={visits.currentVisits.slice(0, PRESENCE_VISITOR_LIMIT)}
      emptyDescription={t("presence.noVisitDescription")}
      emptyTitle={t("presence.noVisitTitle")}
      label={t("presence.labelWithDate", { date: today })}
      locale={locale}
      moreLabel={
        hiddenVisitorCount > 0
          ? t("presence.moreVisitors", { count: hiddenVisitorCount })
          : undefined
      }
      nextVisit={visits.nextVisit}
      nextVisitLabel={nextVisitLabel}
      statement={statement}
      stayRemaining={stayRemaining}
    />
  );
}
