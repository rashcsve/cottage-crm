import type {
  TaskDueKind,
  TaskStatus,
} from "@/features/tasks/types/tasks";
import { isDateOnlyBefore, isSameDateOnly } from "@/lib/utils/date";

export function isTaskOverdue(
  dueDate: string | null,
  status: TaskStatus = "pending",
  today: Date
): boolean {
  if (!dueDate || status !== "pending") {
    return false;
  }

  return isDateOnlyBefore(dueDate, today);
}

export function isTaskDueToday(
  dueDate: string | null,
  status: TaskStatus,
  today: Date
): boolean {
  if (!dueDate || status !== "pending") {
    return false;
  }

  return isSameDateOnly(dueDate, today);
}

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
