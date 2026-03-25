"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Trash2 } from "lucide-react";
import { deleteTaskAction } from "@/features/tasks/server/actions";
import { useToast } from "@/lib/hooks/useToast";
import type { Task } from "@/features/tasks/types/task.types";
import { TaskDeleteDialog } from "./TaskDeleteDialog";

interface TaskActionsProps {
  task: Task;
  canManageTasks: boolean;
}

export function TaskActions({ task, canManageTasks }: TaskActionsProps) {
  const t = useTranslations("tasks");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { error: showError } = useToast();

  if (!canManageTasks) return null;

  const closeDialog = () => setIsDeleteDialogOpen(false);

  function handleConfirmDelete() {
    startTransition(async () => {
      try {
        const result = await deleteTaskAction({ taskId: task.id });

        if (!result.ok) {
          showError(result.error);
          return;
        }

        closeDialog();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : t("common.error");

        showError(message);
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsDeleteDialogOpen(true)}
        disabled={isPending}
        className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-500 transition hover:border-stone-300 hover:text-stone-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label={`${t("aria.deleteTask")} ${task.title}`}
        aria-busy={isPending}
      >
        <Trash2 className="h-4 w-4" aria-hidden="true" />
      </button>

      <TaskDeleteDialog
        task={task}
        isOpen={isDeleteDialogOpen}
        onCancel={closeDialog}
        onConfirm={handleConfirmDelete}
        isDeleting={isPending}
      />
    </>
  );
}
