import type { Task, TaskFilter } from "@/features/tasks/types/task.types";
import { isTaskOverdue } from "@/features/tasks/domain/predicates";

/**
 * Sorts tasks by completion time (most recent first).
 * Only use for "done" tasks.
 *
 * @param tasks Array of completed tasks
 * @returns New array sorted by completedAt descending
 */
export function sortTasksByCompletionTime(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    const timeA = a.completedAt ? new Date(a.completedAt).getTime() : 0;
    const timeB = b.completedAt ? new Date(b.completedAt).getTime() : 0;
    return timeB - timeA;
  });
}

/**
 * Filters tasks by status only.
 * Does not apply additional business logic.
 *
 * @param tasks All tasks
 * @returns Tasks with status === "pending"
 */
export function getTasksByStatus(
  tasks: Task[],
  status: "pending" | "done"
): Task[] {
  return tasks.filter((t) => t.status === status);
}

/**
 * Filters tasks that are overdue.
 * Only pending tasks can be overdue.
 *
 * @param tasks All tasks
 * @param referenceDate Today's date
 * @returns Pending tasks with past due dates
 */
export function getOverdueTasks(tasks: Task[], referenceDate: Date): Task[] {
  return tasks.filter(
    (t) =>
      t.status === "pending" &&
      isTaskOverdue(t.dueDate, t.status, referenceDate)
  );
}

/**
 * Extracts filtered and sorted list for a given filter type.
 * Encapsulates the dispatch logic.
 *
 * @param tasks All tasks
 * @param filter Active filter type
 * @param referenceDate Today's date (for overdue calculation)
 * @returns Filtered and sorted task array
 */
export function getTasksByFilter(
  tasks: Task[],
  filter: TaskFilter,
  referenceDate: Date = new Date()
): Task[] {
  switch (filter) {
    case "pending":
      return getTasksByStatus(tasks, "pending");

    case "overdue":
      return getOverdueTasks(tasks, referenceDate);

    case "done":
      const doneTasks = getTasksByStatus(tasks, "done");
      return sortTasksByCompletionTime(doneTasks);

    default:
      const _exhaustive: never = filter;
      return _exhaustive;
  }
}

/**
 * Counts tasks by category.
 * Global counts (not filtered).
 *
 * @param tasks All tasks
 * @param referenceDate Today's date
 * @returns Object with all counts
 */
export function countTasksByCategory(
  tasks: Task[],
  referenceDate: Date = new Date()
) {
  const pending = getTasksByStatus(tasks, "pending");
  const overdue = getOverdueTasks(tasks, referenceDate);
  const done = getTasksByStatus(tasks, "done");

  return {
    pendingCount: pending.length,
    overdueCount: overdue.length,
    doneCount: done.length,
    totalCount: tasks.length,
  };
}
