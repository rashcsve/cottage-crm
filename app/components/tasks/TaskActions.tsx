"use client";

import {
  deleteTaskAction,
  toggleTaskAction,
} from "@/app/components/tasks/actions";
import { TaskStatus } from "@/app/components/tasks/types";
import { ActionButton } from "@/app/components/ui/ActionsButton";

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
    <div className="flex flex-wrap gap-2">
      <form action={handleToggleTaskAction}>
        <ActionButton>
          {currentStatus === "pending"
            ? "Označit jako hotovo"
            : "Vrátit na čeká"}
        </ActionButton>
      </form>

      <form action={handleDeleteTaskAction}>
        <ActionButton variant="danger">Smazat</ActionButton>
      </form>
    </div>
  );
}
