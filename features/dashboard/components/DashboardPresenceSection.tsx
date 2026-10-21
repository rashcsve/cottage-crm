import { getTranslations } from "next-intl/server";

import { DashboardPresenceCard } from "@/features/dashboard/components/DashboardPresenceCard";
import type { DashboardVisitOverview } from "@/features/dashboard/types/dashboard";

const PRESENCE_VISITOR_LIMIT = 2;

interface DashboardPresenceSectionProps {
  visitsPromise: Promise<DashboardVisitOverview>;
  locale: string;
}

export async function DashboardPresenceSection({
  visitsPromise,
  locale,
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

  const hiddenVisitorCount =
    visits.currentVisits.length - PRESENCE_VISITOR_LIMIT;

  return (
    <DashboardPresenceCard
      currentVisits={visits.currentVisits.slice(0, PRESENCE_VISITOR_LIMIT)}
      emptyDescription={t("presence.noVisitDescription")}
      emptyTitle={t("presence.noVisitTitle")}
      label={t("presence.label")}
      locale={locale}
      moreLabel={
        hiddenVisitorCount > 0
          ? t("presence.moreVisitors", { count: hiddenVisitorCount })
          : undefined
      }
      nextVisit={visits.nextVisit}
      nextVisitLabel={t("presence.nextVisitLabel")}
      statement={statement}
    />
  );
}
