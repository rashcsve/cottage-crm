"use client";

import type { Task, TaskStatus } from "@/features/tasks/types/tasks";
import { TaskActions } from "@/features/tasks/components/TaskActions";
import { TaskDueDate } from "@/features/tasks/components/TaskDueDate";
import { TaskMeta } from "@/features/tasks/components/TaskMeta";
import { TaskToggleButton } from "@/features/tasks/components/TaskToggleButton";
import { useLocale, useTranslations } from "next-intl";

interface TaskItemProps {
  task: Task;
  canManageTasks: boolean;
  onDelete: (task: Task) => void;
  currentUserId: string;
}

function getTaskTitleClassName(status: TaskStatus): string {
  return status === "done" ? "text-stone-500 line-through" : "text-stone-900";
}

export function TaskItem({
  task,
  canManageTasks,
  onDelete,
  currentUserId,
}: TaskItemProps) {
  const locale = useLocale();
  const tItem = useTranslations("tasks.item");
  const tTasks = useTranslations("tasks");
  const tDueDate = useTranslations("tasks.dueDate");
  const tPriority = useTranslations("tasks.priority");
  const isDone = task.status === "done";
  const canDelete = canManageTasks || task.authorId === currentUserId;

  const toggleAriaLabel = isDone
    ? tItem("reopenAria", { title: task.title })
    : tItem("completeAria", { title: task.title });

  const dueDateLabels = {
    completed: tDueDate("completed"),
    overdue: tDueDate("overdue"),
    dueToday: tDueDate("dueToday"),
    dueOn: tDueDate("dueOn"),
  } as const;

  return (
    <li className="group border-b border-stone-200 last:border-b-0">
      <div className="flex gap-3 px-4 py-4 sm:px-5">
        <div className="shrink-0 pt-0.5">
          <TaskToggleButton
            task={task}
            status={task.status}
            ariaLabel={toggleAriaLabel}
            errorMessage={tItem("toggleError")}
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
                <TaskDueDate
                  task={task}
                  locale={locale}
                  labels={dueDateLabels}
                />
                <TaskMeta task={task} priorityLabel={tPriority(task.priority)} />
              </div>
            </div>

            <div className="flex items-start self-start">
              <TaskActions
                task={task}
                canDelete={canDelete}
                onDelete={onDelete}
                deleteAriaLabel={`${tTasks("aria.deleteTask")} ${task.title}`}
              />
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}
