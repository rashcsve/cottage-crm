"use client";

import { useLocale, useTranslations } from "next-intl";
import type { Task, TaskDueKind } from "@/features/tasks/types/task.types";
import { StatusBadge } from "@/shared/ui/StatusBadge";
import type { StatusBadgeTone } from "@/shared/ui/StatusBadge";
import { formatDateOnly } from "@/lib/utils/date";

interface TaskDueDateProps {
  task: Task;
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

export function TaskDueDate({ task }: TaskDueDateProps) {
  const t = useTranslations("tasks.dueDate");
  const locale = useLocale();

  if (!task.dueDate) {
    return null;
  }

  const kind = task.dueKind;

  if (!kind) {
    return null;
  }

  const formattedDate = formatDateOnly(task.dueDate, locale, "d.M");

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
