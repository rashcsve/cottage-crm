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
 * Returns tasks for the requested business category.
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
      return sortTasksByCompletionTime(getTasksByStatus(tasks, "done"));

    default:
      const exhaustiveCheck: never = filter;
      return exhaustiveCheck;
  }
}

/**
 * Global category counts aligned with getTasksByFilter semantics.
 */
export function countTasksByCategory(
  tasks: Task[],
  referenceDate: Date = new Date()
): {
  pendingCount: number;
  overdueCount: number;
  doneCount: number;
  totalCount: number;
} {
  const pendingTasks = getTasksByStatus(tasks, "pending");
  const overdueTasks = getOverdueTasks(tasks, referenceDate);
  const doneTasks = getTasksByStatus(tasks, "done");

  return {
    pendingCount: pendingTasks.length,
    overdueCount: overdueTasks.length,
    doneCount: doneTasks.length,
    totalCount: tasks.length,
  };
}
