"use client";

import { useLocale, useTranslations } from "next-intl";
import type {
  TaskDueKind,
  TaskStatus,
} from "@/features/tasks/types/task.types";
import { StatusBadge } from "@/shared/ui/StatusBadge";
import type { StatusBadgeTone } from "@/shared/ui/StatusBadge";
import { formatDateOnly } from "@/lib/utils/date";
import { deriveTaskDueKind } from "@/features/tasks/domain/predicates";

interface TaskDueDateProps {
  dueDate: string | null;
  status: TaskStatus;
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

export function TaskDueDate({ dueDate, status }: TaskDueDateProps) {
  const t = useTranslations("tasks.dueDate");
  const locale = useLocale();

  if (!dueDate) {
    return null;
  }

  const now = new Date();
  const kind = deriveTaskDueKind(dueDate, status, now);

  if (!kind) {
    return null;
  }

  const formattedDate = formatDateOnly(dueDate, locale, "d.M");

  const labelByKind: Record<TaskDueKind, string> = {
    completed: `${t("completed")} ${formattedDate}`,
    overdue: `${t("overdue")} · ${formattedDate}`,
    dueToday: `${t("dueToday")} · ${formattedDate}`,
    dueOn: `${t("dueOn")} ${formattedDate}`,
  };

  return (
    <StatusBadge tone={getTaskDueTone(kind)}>{labelByKind[kind]}</StatusBadge>
  );
}
