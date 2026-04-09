import { fetchTasks } from "@/features/tasks/server/queries";
import type { TasksPageData } from "@/features/tasks/types/tasks";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { isAdminRole } from "@/lib/auth/is-admin-role";
import { categorizeTasksForPage } from "@/features/tasks/domain/task-categorization";
import { toDateOnlyString } from "@/lib/utils/date";

/**
 * Main server function to fetch and categorize all task data for the tasks page.
 *
 * Responsibilities:
 * - Authenticate user
 * - Check permissions
 * - Fetch all tasks
 * - Categorize by status and business rules
 * - Calculate summary metrics
 * - Return `today` so the page can reuse the same server reference date
 *
 * @returns Complete task data with metadata
 * @throws Error if authentication fails or data fetch fails
 */
export async function getTasksPageData(): Promise<TasksPageData> {
  const profile = await getCurrentProfile();
  if (!profile) {
    throw new Error("User profile not found");
  }

  const canManage = isAdminRole(profile.role);

  const today = toDateOnlyString(new Date());

  const allTasks = await fetchTasks(today);

  const categorized = categorizeTasksForPage(allTasks, today);

  const totalCount = allTasks.length;
  const completionRate =
    totalCount === 0
      ? 0
      : Math.round((categorized.doneCount / totalCount) * 100);

  return {
    pendingTasks: categorized.pendingTasks,
    pendingCount: categorized.pendingCount,
    overdueTasks: categorized.overdueTasks,
    overdueCount: categorized.overdueCount,
    doneTasks: categorized.doneTasks,
    doneCount: categorized.doneCount,
    canManage,
    totalCount,
    completionRate,
    today,
  };
}
