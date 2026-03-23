"use client";

import { deleteTaskAction } from "@/features/tasks/server/actions";
import type { Task } from "@/features/tasks/types/task.types";
import { useTransition, type MouseEvent } from "react";

interface TaskActionsProps {
  task: Task;
  canManageTasks: boolean;
}

// TODO use icon lib
function TrashIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-4 w-4">
      <path
        d="M7 5h6m-8 2h10m-9 0 1 11h6l1-11"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function TaskActions({ task, canManageTasks }: TaskActionsProps) {
  const [isPending, startTransition] = useTransition();

  if (!canManageTasks) return null;

  function handleDeleteClick(e: MouseEvent<HTMLButtonElement>) {
    if (
      !window.confirm(
        `Opravdu smazat úkol "${task.title}"? Vrať se později nedá.`
      )
    ) {
      e.preventDefault();
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
        className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-500 transition hover:border-stone-300 hover:text-stone-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label={`Delete task ${task.title}`}
        aria-busy={isPending}
      >
        <TrashIcon />
      </button>
    </div>
  );
}
