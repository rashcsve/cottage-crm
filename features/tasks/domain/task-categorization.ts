import { Task, TaskData, TaskFilter } from "@/features/tasks/types/task.types";
import {
  countTasksByCategory,
  getTasksByFilter,
} from "@/features/tasks/domain/category-filters";

/**
 * Categorizes tasks into pending, overdue, and done.
 * Returns both filtered lists and global counts.
 *
 * Behavior:
 * - pendingTasks: All pending (not overdue)
 * - overdueTasks: Pending with past due date
 * - doneTasks: All completed, sorted by completion time
 * - Counts are always global (not filtered)
 *
 * @param tasks All user tasks
 * @param today ISO date string (YYYY-MM-DD) to use for overdue calculation
 * @returns Categorized task data
 */
export function categorizeTasksForPage(
  tasks: Task[],
  today: string
): Omit<TaskData, "today"> {
  const todayDate = new Date(`${today}T00:00:00Z`);

  const pendingTasks = getTasksByFilter(tasks, "pending", todayDate);
  const overdueTasks = getTasksByFilter(tasks, "overdue", todayDate);
  const doneTasks = getTasksByFilter(tasks, "done", todayDate);

  const counts = countTasksByCategory(tasks, todayDate);

  return {
    pendingTasks,
    pendingCount: counts.pendingCount,
    overdueTasks,
    overdueCount: counts.overdueCount,
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
 * Type-safe way to extract filtered list from TaskData.
 * Use this if you have TaskData and need to extract one filter's tasks.
 *
 * @param data Complete task data
 * @param filter Which filter to extract
 * @returns Count and tasks for that filter
 */
export function getFilteredListFromCategorized(
  data: Omit<TaskData, "today">,
  filter: TaskFilter
): { count: number; tasks: Task[] } {
  switch (filter) {
    case "pending":
      return { count: data.pendingCount, tasks: data.pendingTasks };
    case "overdue":
      return { count: data.overdueCount, tasks: data.overdueTasks };
    case "done":
      return { count: data.doneCount, tasks: data.doneTasks };
    default:
      const _exhaustive: never = filter;
      return _exhaustive;
  }
}
