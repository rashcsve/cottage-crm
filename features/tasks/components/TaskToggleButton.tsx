"use client";

import { useTransition } from "react";
import { Check } from "lucide-react";
import { toggleTaskAction } from "@/features/tasks/server/actions";
import { useToast } from "@/shared/Toast/useToast";
import type { Task, TaskStatus } from "@/features/tasks/types/tasks";
import { useRouter } from "@/i18n/navigation";

interface TaskToggleButtonProps {
  task: Task;
  status: TaskStatus;
  ariaLabel: string;
  errorMessage: string;
  canManageTasks: boolean;
  currentUserId: string;
}

const BASE_TOGGLE_STYLES =
  "inline-flex h-10 w-10 items-center justify-center rounded-xl border shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:ring-offset-2";

const STATUS_STYLES: Record<TaskStatus, string> = {
  done: "border-emerald-200 bg-emerald-50 text-emerald-700",
  pending:
    "border-stone-300 bg-white text-stone-500 hover:border-stone-400 hover:bg-stone-50 hover:text-stone-700",
};

const INTERACTIVE_TOGGLE_STYLES = `${BASE_TOGGLE_STYLES} cursor-pointer disabled:cursor-not-allowed disabled:opacity-50`;
const READ_ONLY_STATUS_STYLES = `${BASE_TOGGLE_STYLES} border-stone-200 bg-stone-50 text-stone-400`;

export function TaskToggleButton({
  task,
  status,
  ariaLabel,
  errorMessage,
  canManageTasks,
  currentUserId,
}: TaskToggleButtonProps) {
  const [isPending, startTransition] = useTransition();
  const { error: showError } = useToast();
  const router = useRouter();
  const isDone = status === "done";

  const canToggle = canManageTasks || task.authorId === currentUserId;

  if (!canToggle) {
    return (
      <div className={READ_ONLY_STATUS_STYLES} aria-hidden="true">
        {isDone ? <Check className="h-4 w-4" aria-hidden="true" /> : null}
      </div>
    );
  }

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
    <button
      type="button"
      onClick={handleToggleClick}
      disabled={isPending}
      aria-label={ariaLabel}
      aria-busy={isPending}
      aria-pressed={isDone}
      className={`${INTERACTIVE_TOGGLE_STYLES} ${STATUS_STYLES[status]}`}
    >
      {isDone ? <Check className="h-4 w-4" aria-hidden="true" /> : null}
    </button>
  );
}
