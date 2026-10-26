import {
  Calendar,
  Check,
  Clock,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import type { Task, TaskDueKind } from "@/features/tasks/types/tasks";
import { StatusLabel, type StatusLabelTone } from "@/shared/ui/StatusLabel";
import { formatTaskDueDate } from "@/features/tasks/shared/formatTaskDate";

interface TaskDueDateProps {
  task: Task;
  locale: string;
  labels: Record<TaskDueKind, string>;
}

const dueStatusMap: Record<
  TaskDueKind,
  { tone: StatusLabelTone; icon: LucideIcon }
> = {
  overdue: { tone: "danger", icon: TriangleAlert },
  dueToday: { tone: "warning", icon: Clock },
  completed: { tone: "neutral", icon: Check },
  dueOn: { tone: "neutral", icon: Calendar },
};

export function TaskDueDate({ task, locale, labels }: TaskDueDateProps) {
  const { dueDate, dueKind } = task;

  if (!dueDate || !dueKind) {
    return null;
  }

  const { tone, icon } = dueStatusMap[dueKind];

  return (
    <StatusLabel tone={tone} icon={icon} className="whitespace-nowrap text-xs">
      {labels[dueKind]}
      {dueKind === "dueToday" ? null : (
        <>
          {" "}
          <span className="font-mono">{formatTaskDueDate(dueDate, locale)}</span>
        </>
      )}
    </StatusLabel>
  );
}
