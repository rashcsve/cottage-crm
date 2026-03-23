import type { TaskStatus } from "@/features/tasks/types/task.types";
import { StatusBadge } from "@/shared/ui/StatusBadge";
import type { StatusBadgeTone } from "@/shared/ui/StatusBadge";
import {
  getTaskDueLabel,
  isTaskDueToday,
  isTaskOverdue,
} from "@/features/tasks/lib/utils";

// TODO: Consider switching to date-fns
interface TaskDueDateProps {
  dueDate: string | null;
  status: TaskStatus;
}

function getTaskDueTone(
  dueDate: string | null,
  status: TaskStatus,
  now: Date
): StatusBadgeTone {
  if (isTaskOverdue(dueDate, status, now)) return "warning";
  if (isTaskDueToday(dueDate, status, now)) return "warning";

  return "neutral";
}

export function TaskDueDate({ dueDate, status }: TaskDueDateProps) {
  const now = new Date();
  const label = getTaskDueLabel(dueDate, status, now);

  if (!label) return null;

  return (
    <StatusBadge tone={getTaskDueTone(dueDate, status, now)}>
      {label}
    </StatusBadge>
  );
}
