"use client";

import type { Task, TaskStatus } from "@/features/tasks/types/task.types";
import { toggleTaskAction } from "@/features/tasks/server/actions";
import { TaskActions } from "./TaskActions";
import { TaskDueDate } from "./TaskDueDate";
import { TaskMeta } from "./TaskMeta";
import { useTransition } from "react";
import { Check } from "lucide-react";
import { useToast } from "@/lib/hooks/useToast";

interface TaskItemProps {
  task: Task;
  canManageTasks: boolean;
}

function getTaskToggleButtonClassName(status: TaskStatus): string {
  const baseStyles =
    "flex h-8 w-8 items-center justify-center rounded-xl border cursor-pointer transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:ring-offset-2";

  const statusStyles = {
    done: "border-emerald-200 bg-emerald-50 text-emerald-700",
    pending: "border-stone-200 bg-white text-stone-500",
    overdue: "border-amber-200 bg-amber-50 text-amber-700",
  };

  return `${baseStyles} ${statusStyles[status] || statusStyles.pending}`;
}

function getTaskTitleClassName(status: TaskStatus): string {
  return status === "done" ? "text-stone-500 line-through" : "text-stone-900";
}

export function TaskItem({ task, canManageTasks }: TaskItemProps) {
  const [isPending, startTransition] = useTransition();
  const { error: showError } = useToast();
  const isDone = task.status === "done";

  async function handleToggleClick() {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("taskId", String(task.id));
      formData.set("currentStatus", task.status);

      const result = await toggleTaskAction(formData);

      if (!result.ok) {
        showError(result.error);
      }
    });
  }

  return (
    <li className="group border-b border-stone-200 last:border-b-0">
      <div className="flex gap-3 px-4 py-4 sm:px-5">
        <div className="shrink-0 pt-0.5">
          <button
            type="button"
            onClick={handleToggleClick}
            disabled={isPending}
            className={`${getTaskToggleButtonClassName(
              task.status
            )} disabled:cursor-not-allowed disabled:opacity-50`}
            aria-label={
              isDone
                ? `Znovu otevřít úkol: ${task.title}`
                : `Označit úkol jako hotový: ${task.title}`
            }
            aria-busy={isPending}
          >
            {isDone && <Check className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h3
                className={`text-sm font-semibold ${getTaskTitleClassName(
                  task.status
                )}`}
              >
                {task.title}
              </h3>

              {task.description && (
                <p className="mt-1 text-sm leading-6 text-stone-600">
                  {task.description}
                </p>
              )}

              <div className="mt-2 flex flex-wrap items-center gap-2">
                <TaskDueDate dueDate={task.dueDate} status={task.status} />
                <TaskMeta task={task} />
              </div>
            </div>

            <div className="flex items-start self-start">
              <TaskActions task={task} canManageTasks={canManageTasks} />
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}
