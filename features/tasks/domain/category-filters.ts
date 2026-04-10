import type { Task, TaskFilter } from "@/features/tasks/types/tasks";
import { isTaskOverdue } from "@/features/tasks/domain/predicates";

/**
 * Sorts completed tasks by completion time (most recent first).
 */
export function sortTasksByCompletionTime(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    const timeA = a.completedAt ? new Date(a.completedAt).getTime() : 0;
    const timeB = b.completedAt ? new Date(b.completedAt).getTime() : 0;

    return timeB - timeA;
  });
}

/**
 * Low-level status filter.
 * Use business-specific helpers below for page categories.
 */
export function getTasksByStatus(
  tasks: Task[],
  status: "pending" | "done"
): Task[] {
  return tasks.filter((task) => task.status === status);
}

/**
 * Pending tasks with a past due date.
 */
export function getOverdueTasks(tasks: Task[], referenceDate: Date): Task[] {
  return tasks.filter((task) =>
    isTaskOverdue(task.dueDate, task.status, referenceDate)
  );
}

/**
 * Incomplete tasks, including overdue work.
 */
export function getOpenTasks(tasks: Task[], _referenceDate: Date): Task[] {
  void _referenceDate;
  return getTasksByStatus(tasks, "pending");
}

/**
 * Open tasks that are not overdue.
 */
export function getOnTrackTasks(tasks: Task[], referenceDate: Date): Task[] {
  return tasks.filter(
    (task) =>
      task.status === "pending" &&
      !isTaskOverdue(task.dueDate, task.status, referenceDate)
  );
}

/**
 * Returns tasks for the requested business category.
 */
export function getTasksByFilter(
  tasks: Task[],
  filter: TaskFilter,
  referenceDate: Date = new Date()
): Task[] {
  switch (filter) {
    case "open":
      return getOpenTasks(tasks, referenceDate);

    case "done":
      return sortTasksByCompletionTime(getTasksByStatus(tasks, "done"));

    default:
      const exhaustiveCheck: never = filter;
      return exhaustiveCheck;
  }
}

/**
 * Global category counts for the page.
 * `overdueCount` is a subset of `openCount`.
 */
export function countTasksByCategory(
  tasks: Task[],
  referenceDate: Date = new Date()
): {
  openCount: number;
  overdueCount: number;
  onTrackCount: number;
  doneCount: number;
  totalCount: number;
} {
  const openTasks = getOpenTasks(tasks, referenceDate);
  const overdueTasks = getOverdueTasks(tasks, referenceDate);
  const onTrackTasks = getOnTrackTasks(tasks, referenceDate);
  const doneTasks = getTasksByStatus(tasks, "done");

  return {
    openCount: openTasks.length,
    overdueCount: overdueTasks.length,
    onTrackCount: onTrackTasks.length,
    doneCount: doneTasks.length,
    totalCount: tasks.length,
  };
}
