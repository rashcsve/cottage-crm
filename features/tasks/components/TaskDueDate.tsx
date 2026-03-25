import { getLocale, getTranslations } from "next-intl/server";
import type { TaskStatus } from "@/features/tasks/types/task.types";
import { StatusBadge } from "@/shared/ui/StatusBadge";
import type { StatusBadgeTone } from "@/shared/ui/StatusBadge";
import {
  formatTaskDate,
  isTaskDueToday,
  isTaskOverdue,
} from "@/features/tasks/lib/utils";
import { getTaskDueKind } from "@/features/tasks/lib/format";

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

export async function TaskDueDate({ dueDate, status }: TaskDueDateProps) {
  if (!dueDate) return null;

  const now = new Date();
  const t = await getTranslations("tasks.dueDate");
  const locale = await getLocale();

  const kind = getTaskDueKind(dueDate, status, now);
  if (!kind) return null;

  const formattedDate = formatTaskDate(dueDate, locale);
  let label: string;

  switch (kind) {
    case "completed":
      label = `${t("completed")} ${formattedDate}`;
      break;
    case "overdue":
      label = `${t("overdue")} · ${formattedDate}`;
      break;
    case "dueToday":
      label = `${t("dueToday")} · ${formattedDate}`;
      break;
    case "dueOn":
      label = `${t("dueOn")} ${formattedDate}`;
      break;
  }

  return (
    <StatusBadge tone={getTaskDueTone(dueDate, status, now)}>
      {label}
    </StatusBadge>
  );
}
