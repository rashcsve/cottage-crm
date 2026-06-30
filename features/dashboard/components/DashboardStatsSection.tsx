import {
  CalendarRange,
  ListTodo,
  NotebookPen,
  ShoppingCart,
  type LucideIcon,
} from "lucide-react";
import { getTranslations } from "next-intl/server";

import { DashboardPreviewCards } from "@/features/dashboard/components/DashboardPreviewCards";
import { DashboardSummaryCard } from "@/features/dashboard/components/DashboardSummaryCard";
import type { DashboardAccent } from "@/features/dashboard/components/dashboardAccentStyles";
import type {
  DashboardBulkSectionData,
  DashboardVisitOverview,
} from "@/features/dashboard/types/dashboard";
import { dashboardRoutes } from "@/lib/routes";

interface SummaryCardConfig {
  description: string;
  href: string;
  icon: LucideIcon;
  id: DashboardAccent;
  label: string;
  value: number;
}

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
  const [t, tNavigation, visits, bulk] = await Promise.all([
    getTranslations("dashboard.overview"),
    getTranslations("navigation"),
    visitsPromise,
    bulkPromise,
  ]);

  const summaryCards: SummaryCardConfig[] = [
    {
      description: t("summary.visits", { count: visits.currentCount }),
      href: dashboardRoutes.visits,
      icon: CalendarRange,
      id: "visits",
      label: tNavigation("visits"),
      value: visits.upcomingCount,
    },
    {
      description: t("summary.tasks", { count: bulk.tasks.overdueCount }),
      href: dashboardRoutes.tasks,
      icon: ListTodo,
      id: "tasks",
      label: tNavigation("tasks"),
      value: bulk.tasks.openCount,
    },
    {
      description: t("summary.shopping", { count: bulk.shopping.pendingCount }),
      href: dashboardRoutes.shopping,
      icon: ShoppingCart,
      id: "shopping",
      label: tNavigation("shopping"),
      value: bulk.shopping.pendingCount,
    },
    {
      description: t("summary.notes"),
      href: dashboardRoutes.notes,
      icon: NotebookPen,
      id: "notes",
      label: tNavigation("notes"),
      value: bulk.notes.recentNotes.length,
    },
  ];

  return (
    <>
      <section
        aria-label={t("summary.ariaLabel")}
        className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
      >
        {summaryCards.map(({ id, ...card }) => (
          <DashboardSummaryCard key={id} accent={id} {...card} />
        ))}
      </section>

      <DashboardPreviewCards data={bulk} locale={locale} />
    </>
  );
}
