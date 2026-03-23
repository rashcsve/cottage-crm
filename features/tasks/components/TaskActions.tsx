"use client";

import { deleteTaskAction } from "@/features/tasks/server/actions";
import type { Task } from "@/features/tasks/types/task.types";
import type { MouseEvent } from "react";

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
  if (!canManageTasks) return null;

  // TODO add proper UX handling
  function handleDeleteClick(e: MouseEvent<HTMLButtonElement>) {
    if (
      !window.confirm(
        `Opravdu smazat úkol "${task.title}"? Vrať se později nedá.`
      )
    ) {
      e.preventDefault();
    }
  }

  return (
    <div className="flex items-center gap-1">
      {/* TODO: use hook with error handling & other confirmation logic */}
      <form action={deleteTaskAction}>
        <input type="hidden" name="taskId" value={task.id} />
        <button
          type="submit"
          className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-500 transition hover:border-stone-300 hover:text-stone-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:ring-offset-2"
          aria-label={`Smazat úkol ${task.title}`}
          onClick={handleDeleteClick}
        >
          <TrashIcon />
        </button>
      </form>
    </div>
  );
}
