import "server-only";

import {
  DASHBOARD_RECENT_NOTES_LIMIT,
  deriveDashboardNotesOverview,
  deriveDashboardShoppingOverview,
  deriveDashboardTaskOverview,
  deriveDashboardVisitOverview,
} from "@/features/dashboard/domain/overview";
import type {
  DashboardBulkSectionData,
  DashboardOverviewData,
  DashboardVisitOverview,
} from "@/features/dashboard/types/dashboard";
import { getRecentNotes } from "@/features/notes/server/queries";
import { getAllShoppingItems } from "@/features/shopping/server/queries";
import { getAllTasks } from "@/features/tasks/server/queries";
import { categorizeTasksForPage } from "@/features/tasks/domain/task-categorization";
import { getAllVisits } from "@/features/visits/server/queries";
import { getE2EMockDashboardOverviewData } from "@/lib/e2e/mock-data";
import { isE2EMockModeEnabled } from "@/lib/e2e/mock-mode";
import { toDateOnlyString } from "@/lib/utils/date";

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

  const visitsPromise = getAllVisits(todayIso).then((visits) =>
    deriveDashboardVisitOverview(visits),
  );

  const bulkPromise = Promise.all([
    getAllTasks(todayIso),
    getAllShoppingItems(),
    getRecentNotes(DASHBOARD_RECENT_NOTES_LIMIT),
  ]).then(([tasks, shoppingItems, notes]) => {
    const categorizedTasks = categorizeTasksForPage(tasks, todayIso);
    const pendingShoppingItems = shoppingItems.filter((item) => !item.isChecked);
    const purchasedShoppingItems = shoppingItems.filter((item) => item.isChecked);
    return {
      tasks: deriveDashboardTaskOverview(categorizedTasks),
      shopping: deriveDashboardShoppingOverview(pendingShoppingItems, purchasedShoppingItems),
      notes: deriveDashboardNotesOverview(notes),
    };
  });

  return { visitsPromise, bulkPromise };
}

export async function getDashboardOverviewData(): Promise<DashboardOverviewData> {
  if (isE2EMockModeEnabled()) {
    return getE2EMockDashboardOverviewData();
  }

  const todayIso = toDateOnlyString(new Date());

  const [visits, tasks, shoppingItems, notes] =
    await Promise.all([
      getAllVisits(todayIso),
      getAllTasks(todayIso),
      getAllShoppingItems(),
      getRecentNotes(DASHBOARD_RECENT_NOTES_LIMIT),
    ]);

  const categorizedTasks = categorizeTasksForPage(tasks, todayIso);
  const pendingShoppingItems = shoppingItems.filter((item) => !item.isChecked);
  const purchasedShoppingItems = shoppingItems.filter((item) => item.isChecked);

  return {
    todayIso,
    visits: deriveDashboardVisitOverview(visits),
    tasks: deriveDashboardTaskOverview(categorizedTasks),
    shopping: deriveDashboardShoppingOverview(
      pendingShoppingItems,
      purchasedShoppingItems,
    ),
    notes: deriveDashboardNotesOverview(notes),
  };
}
