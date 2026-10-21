import { getTranslations } from "next-intl/server";

import { DashboardPreviewCards } from "@/features/dashboard/components/DashboardPreviewCards";
import {
  DashboardStats,
  type DashboardStat,
} from "@/features/dashboard/components/DashboardStats";
import type {
  DashboardBulkSectionData,
  DashboardVisitOverview,
} from "@/features/dashboard/types/dashboard";
import { dashboardRoutes } from "@/lib/routes";

interface DashboardStatsSectionProps {
  visitsPromise: Promise<DashboardVisitOverview>;
  bulkPromise: Promise<DashboardBulkSectionData>;
  locale: string;
}

export async function DashboardStatsSection({
  visitsPromise,
  bulkPromise,
  locale,
}: DashboardStatsSectionProps) {
  const [t, visits, bulk] = await Promise.all([
    getTranslations("dashboard.overview"),
    visitsPromise,
    bulkPromise,
  ]);

  const stats: DashboardStat[] = [
    {
      id: "visits",
      href: dashboardRoutes.visits,
      label: t("summary.upcomingVisits"),
      value: visits.upcomingCount,
    },
    {
      id: "tasks",
      href: dashboardRoutes.tasks,
      label: t("summary.openTasks"),
      value: bulk.tasks.openCount,
      alert:
        bulk.tasks.overdueCount > 0
          ? t("summary.overdue", { count: bulk.tasks.overdueCount })
          : undefined,
    },
    {
      id: "shopping",
      href: dashboardRoutes.shopping,
      label: t("summary.suppliesToBuy"),
      value: bulk.shopping.pendingCount,
    },
    {
      id: "notes",
      href: dashboardRoutes.notes,
      label: t("summary.recentNotes"),
      value: bulk.notes.recentNotes.length,
    },
  ];

  return (
    <div className="space-y-7 lg:space-y-16">
      <DashboardStats ariaLabel={t("summary.ariaLabel")} stats={stats} />
      <DashboardPreviewCards data={bulk} locale={locale} />
    </div>
  );
}
