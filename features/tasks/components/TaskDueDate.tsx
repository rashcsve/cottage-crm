"use client";

import { useLocale, useTranslations } from "next-intl";
import type { TaskStatus } from "@/features/tasks/types/task.types";
import { StatusBadge } from "@/shared/ui/StatusBadge";
import type { StatusBadgeTone } from "@/shared/ui/StatusBadge";
import {
  deriveTaskDueKind,
  isTaskDueToday,
  isTaskOverdue,
} from "@/features/tasks/domain/predicates";
import { formatTaskDate } from "@/features/tasks/utils/format";

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
  const t = useTranslations("tasks.dueDate");
  const locale = useLocale();

  if (!dueDate) return null;

  const now = new Date();

  const kind = deriveTaskDueKind(dueDate, status, new Date());
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
