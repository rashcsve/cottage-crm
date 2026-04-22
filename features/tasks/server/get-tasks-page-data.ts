import "server-only";

import { getAllTasks } from "@/features/tasks/server/queries";
import type { TasksPageData } from "@/features/tasks/types/tasks";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { isAdminRole } from "@/lib/auth/is-admin-role";
import { categorizeTasksForPage } from "@/features/tasks/domain/task-categorization";
import { toDateOnlyString } from "@/lib/utils/date";

export async function getTasksPageData(): Promise<TasksPageData> {
  const today = toDateOnlyString(new Date());
  const [allTasks, profile] = await Promise.all([
    getAllTasks(today),
    getCurrentProfile(),
  ]);
  const categorized = categorizeTasksForPage(allTasks, today);
  const canManage = isAdminRole(profile.role);

  return {
    openTasks: categorized.openTasks,
    openCount: categorized.openCount,
    overdueTasks: categorized.overdueTasks,
    overdueCount: categorized.overdueCount,
    onTrackTasks: categorized.onTrackTasks,
    onTrackCount: categorized.onTrackCount,
    doneTasks: categorized.doneTasks,
    doneCount: categorized.doneCount,
    canManage,
    currentUserId: profile.id,
  };
}
