import "server-only";

import {
  DASHBOARD_PREVIEW_ITEM_LIMIT,
  DASHBOARD_RECENT_NOTES_LIMIT,
  deriveDashboardNotesOverview,
  deriveDashboardTaskOverview,
  deriveDashboardVisitOverview,
} from "@/features/dashboard/domain/overview";
import type {
  DashboardBulkSectionData,
  DashboardVisitOverview,
} from "@/features/dashboard/types/dashboard";
import { getRecentNotes } from "@/features/notes/server/queries";
import { getShoppingOverview } from "@/features/shopping/server/queries";
import { getOpenTasks } from "@/features/tasks/server/queries";
import { categorizeTasksForPage } from "@/features/tasks/domain/task-categorization";
import { getActiveAndUpcomingVisits } from "@/features/visits/server/queries";
import { getE2EMockDashboardOverviewData } from "@/lib/e2e/mock-data";
import { isE2EMockModeEnabled } from "@/lib/e2e/mock-mode";

export function startDashboardStreaming(todayIso: string): {
  visitsPromise: Promise<DashboardVisitOverview>;
  bulkPromise: Promise<DashboardBulkSectionData>;
} {
  if (isE2EMockModeEnabled()) {
    const mockData = getE2EMockDashboardOverviewData();
    return {
      visitsPromise: Promise.resolve(mockData.visits),
      bulkPromise: Promise.resolve({
        tasks: mockData.tasks,
        shopping: mockData.shopping,
        notes: mockData.notes,
      }),
    };
  }

  const visitsPromise = getActiveAndUpcomingVisits(todayIso).then((visits) =>
    deriveDashboardVisitOverview(visits),
  );

  const bulkPromise = Promise.all([
    getOpenTasks(todayIso),
    getShoppingOverview(DASHBOARD_PREVIEW_ITEM_LIMIT),
    getRecentNotes(DASHBOARD_RECENT_NOTES_LIMIT),
  ]).then(([openTasks, shopping, notes]) => ({
    tasks: deriveDashboardTaskOverview(
      categorizeTasksForPage(openTasks, todayIso),
    ),
    shopping,
    notes: deriveDashboardNotesOverview(notes),
  }));

  return { visitsPromise, bulkPromise };
}
