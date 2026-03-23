"use client";

import { deleteTaskAction } from "@/features/tasks/server/actions";
import type { Task } from "@/features/tasks/types/task.types";
import { Trash2 } from "lucide-react";
import { useTransition } from "react";

interface TaskActionsProps {
  task: Task;
  canManageTasks: boolean;
}

export function TaskActions({ task, canManageTasks }: TaskActionsProps) {
  const [isPending, startTransition] = useTransition();

  if (!canManageTasks) return null;

  function handleDeleteClick() {
    if (
      !window.confirm(
        `Opravdu smazat úkol "${task.title}"? Vrať se později nedá.`
      )
    ) {
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.set("taskId", String(task.id));

      const result = await deleteTaskAction(formData);

      if (!result.ok) {
        // TODO: add toast/error notification
        console.error("Failed to delete task:", result.error);
      }
    });
  }

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={handleDeleteClick}
        disabled={isPending}
        className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-500 transition hover:border-stone-300 hover:text-stone-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label={`Delete task ${task.title}`}
        aria-busy={isPending}
      >
        <Trash2 className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}
