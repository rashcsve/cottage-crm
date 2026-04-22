import type { Task, TaskDueKind } from "@/features/tasks/types/tasks";
import { StatusBadge } from "@/shared/ui/StatusBadge";
import type { StatusBadgeTone } from "@/shared/ui/StatusBadge";
import { formatTaskDueDate } from "@/features/tasks/shared/formatTaskDate";

interface TaskDueDateProps {
  task: Task;
  locale: string;
  labels: Record<TaskDueKind, string>;
}

const dueToneMap: Record<TaskDueKind, StatusBadgeTone> = {
  overdue: "warning",
  dueToday: "warning",
  completed: "neutral",
  dueOn: "neutral",
};

export function TaskDueDate({ task, locale, labels }: TaskDueDateProps) {
  const { dueDate, dueKind } = task;

  if (!dueDate || !dueKind) {
    return null;
  }

  const formattedDate = formatTaskDueDate(dueDate, locale);
  const text =
    dueKind === "dueToday"
      ? labels[dueKind]
      : `${labels[dueKind]} ${formattedDate}`;

  return (
    <StatusBadge
      tone={dueToneMap[dueKind]}
      className="px-2.5 py-1 text-[11px] font-medium"
    >
      {text}
    </StatusBadge>
  );
}
