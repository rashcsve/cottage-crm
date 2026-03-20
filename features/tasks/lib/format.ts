import {
  isTaskDueToday,
  isTaskOverdue,
} from "@/features/tasks/lib/derive";
import {
  TaskPriority,
  TaskStatus,
} from "@/features/tasks/types/task.types";

export function formatTaskDate(date: string): string {
  return new Intl.DateTimeFormat("cs-CZ", {
    day: "numeric",
    month: "numeric",
  }).format(new Date(date));
}

export function getTaskPriorityLabel(priority: TaskPriority): string {
  switch (priority) {
    case "high":
      return "Vysoká";
    case "medium":
      return "Střední";
    case "low":
      return "Nízká";
    default:
      return "Střední";
  }
}

export function getTaskDueLabel(
  dueDate: string | null,
  status: TaskStatus = "pending"
): string | null {
  if (!dueDate) return null;

  const formatted = formatTaskDate(dueDate);

  if (status === "done") {
    return `Termín ${formatted}`;
  }

  if (isTaskOverdue(dueDate, status)) {
    return `Po termínu · ${formatted}`;
  }

  if (isTaskDueToday(dueDate, status)) {
    return `Dnes · ${formatted}`;
  }

  return `Termín ${formatted}`;
}

