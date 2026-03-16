"use client";

import { deleteTaskAction, toggleTaskAction } from "@/components/tasks/actions";
import { TaskStatus } from "@/components/tasks/types";

type TaskActionsProps = {
  taskId: number;
  currentStatus: TaskStatus;
};

export function TaskActions({ taskId, currentStatus }: TaskActionsProps) {
  const handleToggleTaskAction = toggleTaskAction.bind(
    null,
    taskId,
    currentStatus
  );
  const handleDeleteTaskAction = deleteTaskAction.bind(null, taskId);

  return (
    <div className="flex flex-wrap gap-2">
      <form action={handleToggleTaskAction}>
        <button
          type="submit"
          className="rounded-xl border border-stone-300 px-4 py-2 text-sm font-medium transition hover:bg-stone-100 cursor-pointer"
        >
          {currentStatus === "pending"
            ? "Označit jako hotovo"
            : "Vrátit na čeká"}
        </button>
      </form>

      <form action={handleDeleteTaskAction}>
        <button
          type="submit"
          className="rounded-xl border border-red-200 px-4 py-2 text-sm text-red-700 font-medium transition hover:bg-red-50 cursor-pointer"
        >
          Smazat
        </button>
      </form>
    </div>
  );
}
