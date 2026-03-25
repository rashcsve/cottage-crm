import { isTaskDueToday, isTaskOverdue } from "./derive";
import type {
  TaskDueKind,
  TaskStatus,
} from "@/features/tasks/types/task.types";

export function formatTaskDate(date: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "numeric",
  }).format(new Date(date));
}

export function getTaskDueKind(
  dueDate: string | null,
  status: TaskStatus,
  now: Date
): TaskDueKind | null {
  if (!dueDate) return null;

  if (status === "done") return "completed";
  if (isTaskOverdue(dueDate, status, now)) return "overdue";
  if (isTaskDueToday(dueDate, status, now)) return "dueToday";

  return "dueOn";
}
