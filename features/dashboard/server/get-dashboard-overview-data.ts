import "server-only";

import {
  DASHBOARD_RECENT_NOTES_LIMIT,
  deriveDashboardNotesOverview,
  deriveDashboardShoppingOverview,
  deriveDashboardTaskOverview,
  deriveDashboardVisitOverview,
} from "@/features/dashboard/domain/overview";
import type { DashboardOverviewData } from "@/features/dashboard/types/dashboard";
import { getCurrentCottageWeather } from "@/features/dashboard/server/weather";
import { getRecentNotes } from "@/features/notes/server/queries";
import { getAllShoppingItems } from "@/features/shopping/server/queries";
import { getAllTasks } from "@/features/tasks/server/queries";
import { categorizeTasksForPage } from "@/features/tasks/domain/task-categorization";
import { getAllVisits } from "@/features/visits/server/queries";
import { toDateOnlyString } from "@/lib/utils/date";

export async function getDashboardOverviewData(): Promise<DashboardOverviewData> {
  const todayIso = toDateOnlyString(new Date());

  const [visits, tasks, shoppingItems, notes, weather] =
    await Promise.all([
      getAllVisits(todayIso),
      getAllTasks(todayIso),
      getAllShoppingItems(),
      getRecentNotes(DASHBOARD_RECENT_NOTES_LIMIT),
      getCurrentCottageWeather(),
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
    weather,
  };
}
