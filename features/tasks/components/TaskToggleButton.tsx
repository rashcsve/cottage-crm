"use client";

import { useTransition } from "react";
import { toggleTaskAction } from "@/features/tasks/server/actions";
import { useToast } from "@/shared/Toast/useToast";
import { CheckToggle } from "@/shared/ui/CheckToggle";
import type { Task, TaskStatus } from "@/features/tasks/types/tasks";
import { useRouter } from "@/i18n/navigation";

interface TaskToggleButtonProps {
  task: Task;
  status: TaskStatus;
  ariaLabel: string;
  readOnlyStateLabel: string;
  errorMessage: string;
  canManageTasks: boolean;
  currentUserId: string;
}

export function TaskToggleButton({
  task,
  status,
  ariaLabel,
  readOnlyStateLabel,
  errorMessage,
  canManageTasks,
  currentUserId,
}: TaskToggleButtonProps) {
  const [isPending, startTransition] = useTransition();
  const { error: showError } = useToast();
  const router = useRouter();
  const isDone = status === "done";

  const canToggle = canManageTasks || task.authorId === currentUserId;

  function handleToggleClick() {
    startTransition(async () => {
      try {
        const result = await toggleTaskAction({ taskId: task.id });

        if (!result.ok) {
          showError(result.error || errorMessage);
          return;
        }

        router.refresh();
      } catch (error) {
        showError(error instanceof Error ? error.message : errorMessage);
      }
    });
  }

  return (
    <CheckToggle
      checked={isDone}
      label={ariaLabel}
      pending={isPending}
      readOnly={!canToggle}
      readOnlyStateLabel={readOnlyStateLabel}
      onToggle={handleToggleClick}
    />
  );
}
