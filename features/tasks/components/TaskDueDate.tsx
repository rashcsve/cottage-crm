import type { Task, TaskDueKind } from "@/features/tasks/types/tasks";
import { StatusBadge } from "@/shared/ui/StatusBadge";
import type { StatusBadgeTone } from "@/shared/ui/StatusBadge";
import { formatDateOnly } from "@/lib/utils/date";

interface TaskDueDateProps {
  task: Task;
  locale: string;
  labels: Record<TaskDueKind, string>;
}

function getTaskDueTone(kind: TaskDueKind): StatusBadgeTone {
  switch (kind) {
    case "overdue":
    case "dueToday":
      return "warning";
    case "completed":
    case "dueOn":
      return "neutral";
  }
}

export function TaskDueDate({ task, locale, labels }: TaskDueDateProps) {
  if (!task.dueDate) {
    return null;
  }

  const kind = task.dueKind;

  if (!kind) {
    return null;
  }

  const formattedDate = formatDateOnly(task.dueDate, locale, "d.M");
  const separator = kind === "overdue" || kind === "dueToday" ? " · " : " ";

  return (
    <StatusBadge tone={getTaskDueTone(kind)}>
      {`${labels[kind]}${separator}${formattedDate}`}
    </StatusBadge>
  );
}
