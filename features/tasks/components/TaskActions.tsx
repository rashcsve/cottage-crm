"use client";

import { useTranslations } from "next-intl";
import { Trash2 } from "lucide-react";
import type { Task } from "@/features/tasks/types/task.types";

interface TaskActionsProps {
  task: Task;
  canManageTasks: boolean;
  onDelete: (task: Task) => void;
  currentUserId: string;
}

export function TaskActions({
  task,
  canManageTasks,
  onDelete,
  currentUserId,
}: TaskActionsProps) {
  const t = useTranslations("tasks");

  const canDelete = canManageTasks || task.authorId === currentUserId;

  if (!canDelete) return null;

  return (
    <button
      type="button"
      onClick={() => onDelete(task)}
      className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-500 transition hover:border-stone-300 hover:text-stone-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      aria-label={`${t("aria.deleteTask")} ${task.title}`}
    >
      <Trash2 className="h-4 w-4" aria-hidden="true" />
    </button>
  );
}
