"use client";

import {
  deleteTaskAction,
  toggleTaskAction,
} from "@/app/(dashboard)/tasks/actions";
import { TaskStatus } from "@/app/components/tasks/types";
import { ActionButton } from "@/app/components/ui/ActionButton";

interface TaskActionsProps {
  taskId: number;
  currentStatus: TaskStatus;
}

export function TaskActions({ taskId, currentStatus }: TaskActionsProps) {
  const handleToggleTaskAction = toggleTaskAction.bind(
    null,
    taskId,
    currentStatus
  );

  const handleDeleteTaskAction = deleteTaskAction.bind(null, taskId);

  return (
    <div className="flex flex-col items-start gap-2">
      <form action={handleToggleTaskAction}>
        <ActionButton>
          {currentStatus === "pending"
            ? "Označit jako hotovo"
            : "Vrátit na čeká"}
        </ActionButton>
      </form>

      <form action={handleDeleteTaskAction}>
        <ActionButton tone="danger">Smazat</ActionButton>
      </form>
    </div>
  );
}
