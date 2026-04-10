import type {
  CategorizedTasks,
  Task,
  TaskFilter,
} from "@/features/tasks/types/tasks";
import {
  countTasksByCategory,
  getOnTrackTasks,
  getOverdueTasks,
  getTasksByFilter,
} from "@/features/tasks/domain/category-filters";

/**
 * Categorizes tasks into open, overdue, on-track, and done collections.
 * Returns both filtered lists and global counts.
 *
 * Behavior:
 * - openTasks: All incomplete tasks
 * - overdueTasks: Open tasks with past due dates
 * - onTrackTasks: Open tasks that are not overdue
 * - doneTasks: All completed, sorted by completion time
 * - `overdueCount` is a subset of `openCount`
 *
 * @param tasks All user tasks
 * @param today ISO date string (YYYY-MM-DD) to use for overdue calculation
 * @returns Categorized task data
 */
export function categorizeTasksForPage(
  tasks: Task[],
  today: string
): CategorizedTasks {
  const todayDate = new Date(`${today}T00:00:00Z`);

  const openTasks = getTasksByFilter(tasks, "open", todayDate);
  const overdueTasks = getOverdueTasks(tasks, todayDate);
  const onTrackTasks = getOnTrackTasks(tasks, todayDate);
  const doneTasks = getTasksByFilter(tasks, "done", todayDate);

  const counts = countTasksByCategory(tasks, todayDate);

  return {
    openTasks,
    openCount: counts.openCount,
    overdueTasks,
    overdueCount: counts.overdueCount,
    onTrackTasks,
    onTrackCount: counts.onTrackCount,
    doneTasks,
    doneCount: counts.doneCount,
  };
}

/**
 * Gets a single filtered list with its count.
 * Useful for components that only need one filter type.
 *
 * @param tasks All tasks
 * @param filter Which filter to apply
 * @param today ISO date string (YYYY-MM-DD)
 * @returns { count, tasks } for the filter
 */
export function getFilteredTaskList(
  tasks: Task[],
  filter: TaskFilter,
  today: string
) {
  const todayDate = new Date(`${today}T00:00:00Z`);
  const filtered = getTasksByFilter(tasks, filter, todayDate);
  return {
    count: filtered.length,
    tasks: filtered,
  };
}

/**
 * Type-safe way to extract one filtered list from categorized task collections.
 *
 * @param data Categorized task collections
 * @param filter Which filter to extract
 * @returns Count and tasks for that filter
 */
export function getFilteredListFromCategorized(
  data: CategorizedTasks,
  filter: TaskFilter
): { count: number; tasks: Task[] } {
  switch (filter) {
    case "open":
      return { count: data.openCount, tasks: data.openTasks };
    case "done":
      return { count: data.doneCount, tasks: data.doneTasks };
    default:
      const _exhaustive: never = filter;
      return _exhaustive;
  }
}
