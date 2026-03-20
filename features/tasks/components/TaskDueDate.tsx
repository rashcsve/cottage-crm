import { TaskStatus } from "@/features/tasks/types/task.types";
import {
  getTaskDueLabel,
  isTaskDueToday,
  isTaskOverdue,
} from "@/features/tasks/lib/utils";

interface TaskDueDateProps {
  dueDate: string | null;
  status: TaskStatus;
}

export function TaskDueDate({ dueDate, status }: TaskDueDateProps) {
  const label = getTaskDueLabel(dueDate, status);

  if (!label) return null;

  const className = isTaskOverdue(dueDate, status)
    ? "border-red-200 bg-red-50 text-red-700"
    : isTaskDueToday(dueDate, status)
      ? "border-amber-200 bg-amber-50 text-amber-700"
      : "border-stone-200 bg-stone-50 text-stone-700";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium whitespace-nowrap ${className}`}
    >
      {label}
    </span>
  );
}

