"use client";

import type { Task, TaskStatus } from "@/features/tasks/types/task.types";
import { TaskActions } from "@/features/tasks/components/TaskActions";
import { TaskDueDate } from "@/features/tasks/components/TaskDueDate";
import { TaskMeta } from "@/features/tasks/components/TaskMeta";
import { TaskToggleButton } from "@/features/tasks/components/TaskToggleButton";
import { useTranslations } from "next-intl";

interface TaskItemProps {
  task: Task;
  canManageTasks: boolean;
  onDelete: (task: Task) => void;
  currentUserId: string;
  today: string;
}

function getTaskTitleClassName(status: TaskStatus): string {
  return status === "done" ? "text-stone-500 line-through" : "text-stone-900";
}

export function TaskItem({
  task,
  canManageTasks,
  onDelete,
  currentUserId,
  today,
}: TaskItemProps) {
  const t = useTranslations("tasks.item");
  const isDone = task.status === "done";

  const toggleAriaLabel = isDone
    ? t("reopenAria", { title: task.title })
    : t("completeAria", { title: task.title });

  return (
    <li className="group border-b border-stone-200 last:border-b-0">
      <div className="flex gap-3 px-4 py-4 sm:px-5">
        <div className="shrink-0 pt-0.5">
          <TaskToggleButton
            task={task}
            status={task.status}
            ariaLabel={toggleAriaLabel}
            errorMessage={t("toggleError")}
            canManageTasks={canManageTasks}
            currentUserId={currentUserId}
          />
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
                <TaskDueDate task={task} today={today} />
                <TaskMeta task={task} />
              </div>
            </div>

            <div className="flex items-start self-start">
              <TaskActions
                task={task}
                canManageTasks={canManageTasks}
                onDelete={onDelete}
                currentUserId={currentUserId}
              />
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}
