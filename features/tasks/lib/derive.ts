import { TaskStatus } from "@/features/tasks/types/task.types";

export function isTaskOverdue(
  dueDate: string | null,
  status: TaskStatus = "pending",
  referenceDate: Date = new Date()
): boolean {
  if (!dueDate || status === "done") return false;

  const today = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    referenceDate.getDate()
  );

  const due = new Date(dueDate);
  const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());

  return dueDay < today;
}

export function isTaskDueToday(
  dueDate: string | null,
  status: TaskStatus = "pending",
  referenceDate: Date = new Date()
): boolean {
  if (!dueDate || status === "done") return false;

  const today = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    referenceDate.getDate()
  );

  const due = new Date(dueDate);
  const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());

  return dueDay.getTime() === today.getTime();
}

