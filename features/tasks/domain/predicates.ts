import { TaskDueKind, TaskStatus } from "@/features/tasks/types/task.types";

/**
 * Determines if a task is overdue.
 * Only pending tasks can be overdue.
 *
 * @param dueDate ISO date string or null
 * @param status Task status
 * @param today Reference date (usually today)
 * @returns true if task is pending and due date has passed
 */
export function isTaskOverdue(
  dueDate: string | null,
  status: TaskStatus = "pending",
  today: Date
): boolean {
  if (!dueDate || status !== "pending") {
    return false;
  }

  const dueDateObj = new Date(dueDate);
  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  return dueDateObj < todayStart;
}

/**
 * Determines if a task is due today.
 * Only pending tasks can be due today.
 *
 * @param dueDate ISO date string or null
 * @param status Task status
 * @param today Reference date (usually today)
 * @returns true if task is pending and due date is today
 */
export function isTaskDueToday(
  dueDate: string | null,
  status: TaskStatus,
  today: Date
): boolean {
  if (!dueDate || status !== "pending") {
    return false;
  }

  const dueDateObj = new Date(dueDate);
  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

  return dueDateObj >= todayStart && dueDateObj < todayEnd;
}

/**
 * Determines the time-based category for task display.
 *
 * Categories:
 * - "completed": Task is done
 * - "overdue": Task is pending and past due
 * - "dueToday": Task is pending and due today
 * - "dueOn": Task is pending with future due date
 * - null: No due date or can't be categorized
 *
 * @param dueDate ISO date string or null
 * @param status Task status
 * @param today Reference date (usually today)
 * @returns TaskDueKind or null
 */
export function deriveTaskDueKind(
  dueDate: string | null,
  status: TaskStatus,
  today: Date
): TaskDueKind | null {
  if (status === "done") {
    return "completed";
  }

  if (!dueDate) {
    return null;
  }

  if (isTaskOverdue(dueDate, status, today)) {
    return "overdue";
  }

  if (isTaskDueToday(dueDate, status, today)) {
    return "dueToday";
  }

  return "dueOn";
}
