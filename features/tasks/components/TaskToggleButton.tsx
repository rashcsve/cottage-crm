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
  canManageTasks: boolean;
}

const BASE_TOGGLE_STYLES =
  "flex h-8 w-8 items-center justify-center rounded-xl border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:ring-offset-2";

const STATUS_STYLES: Record<TaskStatus, string> = {
  done: "border-emerald-200 bg-emerald-50 text-emerald-700",
  pending: "border-stone-200 bg-white text-stone-500",
};

const INTERACTIVE_TOGGLE_STYLES = `${BASE_TOGGLE_STYLES} cursor-pointer hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50`;
const READ_ONLY_STATUS_STYLES = `${BASE_TOGGLE_STYLES} cursor-not-allowed border-stone-200 bg-stone-50`;

export function TaskToggleButton({
  taskId,
  status,
  ariaLabel,
  errorMessage,
  canManageTasks,
}: TaskToggleButtonProps) {
  const [isPending, startTransition] = useTransition();
  const { error: showError } = useToast();
  const isDone = status === "done";

  if (!canManageTasks) {
    return (
      <div className={READ_ONLY_STATUS_STYLES}>
        {isDone && <span className="text-xs text-stone-400">✓</span>}
      </div>
    );
  }

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
      className={`${INTERACTIVE_TOGGLE_STYLES} ${STATUS_STYLES[status]}`}
    >
      {isDone && <Check className="h-5 w-5" aria-hidden="true" />}
    </button>
  );
}
