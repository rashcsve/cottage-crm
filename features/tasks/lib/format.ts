import { isTaskDueToday, isTaskOverdue } from "@/features/tasks/lib/derive";
import type {
  TaskPriority,
  TaskStatus,
} from "@/features/tasks/types/task.types";

const taskDateFormatter = new Intl.DateTimeFormat("cs-CZ", {
  day: "numeric",
  month: "numeric",
});

export function formatTaskDate(date: string): string {
  return taskDateFormatter.format(new Date(date));
}

export function getTaskPriorityLabel(priority: TaskPriority): string {
  switch (priority) {
    case "high":
      return "Vysoká";
    case "medium":
      return "Střední";
    case "low":
      return "Nízká";
  }
}

export function getTaskDueLabel(
  dueDate: string | null,
  status: TaskStatus,
  referenceDate?: Date
): string | null {
  if (!dueDate) return null;

  const now = referenceDate ?? new Date();
  const formattedDate = formatTaskDate(dueDate);

  if (status === "done") {
    return `Termín ${formattedDate}`;
  }

  if (isTaskOverdue(dueDate, status, now)) {
    return `Po termínu · ${formattedDate}`;
  }

  if (isTaskDueToday(dueDate, status, now)) {
    return `Dnes · ${formattedDate}`;
  }

  return `Termín ${formattedDate}`;
}
