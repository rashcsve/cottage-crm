import { isTaskOverdue, mapTaskRowToTask } from "@/features/tasks/lib/utils";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { isAdminRole } from "@/lib/auth/is-admin-role";
import { createClient } from "@/lib/supabase/server";

import type { Task, TaskFilter } from "@/features/tasks/types/task.types";

/**
 * Task data structure returned by getTasksPageData.
 * Includes categorized tasks and summary counts.
 */
interface TasksPageData {
  canManage: boolean;
  pendingTasks: Task[];
  overdueTasks: Task[];
  recentDoneTasks: Task[];
  totalCount: number;
  pendingCount: number;
  doneCount: number;
  overdueCount: number;
  completionRate: number;
}

/**
 * Fetches and categorizes tasks for the tasks page.
 *
 * Behavior:
 * - Only pending tasks can be marked as overdue
 * - Done tasks are only returned if filter is "done" (limited to 5 items for pagination)
 * - All counts are global (not filtered), allowing UI to show totals
 * - Filtered arrays contain only tasks matching the active filter
 *
 * @param activeFilter - Which task category to fetch: "pending", "overdue", or "done"
 * @returns TasksPageData with categorized tasks and summary information
 * @throws Error if task fetch or profile lookup fails
 */
export async function getTasksPageData(
  activeFilter: TaskFilter
): Promise<TasksPageData> {
  const supabase = await createClient();
  const profile = await getCurrentProfile();

  // Note: getCurrentProfile() should never return null in this context,
  // but adding explicit check for type safety.
  if (!profile) {
    throw new Error("Nepodařilo se načíst profil uživatele");
  }

  const canManage = isAdminRole(profile.role);

  const { data, error } = await supabase
    .from("tasks")
    .select(
      `
      id,
      title,
      description,
      status,
      priority,
      author_id,
      assignee_id,
      visit_id,
      due_date,
      created_at,
      updated_at,
      completed_at,
      author:profiles!tasks_author_id_fkey (
        display_name
      ),
      assignee:profiles!tasks_assignee_id_fkey (
        display_name
      )
    `
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Nepodařilo se načíst úkoly: ${error.message}`);
  }

  const tasks: Task[] = (data ?? []).map(mapTaskRowToTask);

  // Categorize tasks based on status and filter
  const pendingTasks: Task[] = [];
  const overdueTasks: Task[] = [];
  const recentDoneTasks: Task[] = [];

  let pendingCount = 0;
  let doneCount = 0;
  let overdueCount = 0;

  for (const task of tasks) {
    const isPending = task.status === "pending";
    const isDone = task.status === "done";
    const isOverdue = isPending && isTaskOverdue(task.dueDate, task.status);

    if (isPending) {
      pendingCount += 1;

      // Add to filtered results if filter matches
      if (activeFilter === "pending") {
        pendingTasks.push(task);
      }

      // Count and filter overdue tasks (only pending can be overdue)
      if (isOverdue) {
        overdueCount += 1;
        if (activeFilter === "overdue") {
          overdueTasks.push(task);
        }
      }
    }

    // Count and filter done tasks
    if (isDone) {
      doneCount += 1;

      if (activeFilter === "done") {
        recentDoneTasks.push(task);
      }
    }
  }

  const totalCount = tasks.length;
  const completionRate =
    totalCount === 0 ? 0 : Math.round((doneCount / totalCount) * 100);

  return {
    canManage,
    pendingTasks,
    overdueTasks,
    recentDoneTasks,
    totalCount,
    pendingCount,
    doneCount,
    overdueCount,
    completionRate,
  };
}
