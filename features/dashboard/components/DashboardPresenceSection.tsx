import { getTranslations } from "next-intl/server";

import { DashboardPresenceCard } from "@/features/dashboard/components/DashboardPresenceCard";
import type { DashboardVisitOverview } from "@/features/dashboard/types/dashboard";

interface DashboardPresenceSectionProps {
  visitsPromise: Promise<DashboardVisitOverview>;
  todayIso: string;
  locale: string;
}

export async function DashboardPresenceSection({
  visitsPromise,
  todayIso,
  locale,
}: DashboardPresenceSectionProps) {
  const [t, visits] = await Promise.all([
    getTranslations("dashboard.overview"),
    visitsPromise,
  ]);

  const hasCurrentVisits = visits.currentCount > 0;
  const hasNextVisit = Boolean(visits.nextVisit);
  const visitTone = hasCurrentVisits ? "success" : "neutral";

  const presenceBadgeLabel = hasCurrentVisits
    ? t("presence.currentBadge", { count: visits.currentCount })
    : t("presence.emptyBadge");

  const presenceDescription = hasCurrentVisits
    ? t("presence.currentDescription")
    : hasNextVisit
      ? t("presence.nextDescription")
      : t("presence.emptyDescription");

  const presenceTitle = hasCurrentVisits
    ? t("presence.currentTitle")
    : t("presence.emptyTitle");

  return (
    <DashboardPresenceCard
      badgeLabel={presenceBadgeLabel}
      currentVisits={visits.currentVisits}
      description={presenceDescription}
      emptyDescription={t("presence.noVisitDescription")}
      emptyTitle={t("presence.noVisitTitle")}
      locale={locale}
      nextVisit={visits.nextVisit}
      nextVisitLabel={t("presence.nextVisitLabel")}
      title={presenceTitle}
      todayIso={todayIso}
      tone={visitTone}
    />
  );
}
