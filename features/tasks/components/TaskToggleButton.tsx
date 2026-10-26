"use client";

import { useTransition } from "react";
import { toggleTaskAction } from "@/features/tasks/server/actions";
import { useToast } from "@/shared/Toast/useToast";
import { CheckToggle } from "@/shared/ui/CheckToggle";
import type { Task } from "@/features/tasks/types/tasks";
import { useRouter } from "@/i18n/navigation";

interface TaskToggleButtonProps {
  taskId: Task["id"];
  isDone: boolean;
  canToggle: boolean;
  ariaLabel: string;
  readOnlyStateLabel: string;
  errorMessage: string;
}

export function TaskToggleButton({
  taskId,
  isDone,
  canToggle,
  ariaLabel,
  readOnlyStateLabel,
  errorMessage,
}: TaskToggleButtonProps) {
  const [isPending, startTransition] = useTransition();
  const { error: showError } = useToast();
  const router = useRouter();

  function handleToggleClick() {
    startTransition(async () => {
      try {
        const result = await toggleTaskAction({ taskId });

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
