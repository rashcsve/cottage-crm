"use client";

import { useTransition } from "react";
import { Check } from "lucide-react";
import { toggleTaskAction } from "@/features/tasks/server/actions";
import { useToast } from "@/lib/hooks/useToast";
import type { TaskStatus } from "@/features/tasks/types/task.types";

interface TaskToggleButtonProps {
  taskId: number;
  status: TaskStatus;
  ariaLabel: string;
  errorMessage: string;
}

function getTaskToggleButtonClassName(status: TaskStatus): string {
  const baseStyles =
    "flex h-8 w-8 items-center justify-center rounded-xl border cursor-pointer transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:ring-offset-2";

  const statusStyles = {
    done: "border-emerald-200 bg-emerald-50 text-emerald-700",
    pending: "border-stone-200 bg-white text-stone-500",
    overdue: "border-amber-200 bg-amber-50 text-amber-700",
  };

  return `${baseStyles} ${statusStyles[status]}`;
}

export function TaskToggleButton({
  taskId,
  status,
  ariaLabel,
  errorMessage,
}: TaskToggleButtonProps) {
  const [isPending, startTransition] = useTransition();
  const { error: showError } = useToast();
  const isDone = status === "done";

  function handleToggleClick() {
    startTransition(async () => {
      try {
        const result = await toggleTaskAction({ taskId });

        if (!result.ok) {
          showError(result.error || errorMessage);
        }
      } catch (error) {
        showError(error instanceof Error ? error.message : errorMessage);
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleToggleClick}
      disabled={isPending}
      aria-label={ariaLabel}
      aria-busy={isPending}
      className={`${getTaskToggleButtonClassName(
        status
      )} disabled:cursor-not-allowed disabled:opacity-50`}
    >
      {isDone && <Check className="h-5 w-5" aria-hidden="true" />}
    </button>
  );
}
