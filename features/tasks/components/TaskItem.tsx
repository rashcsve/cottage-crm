"use client";

import type { Task, TaskStatus } from "@/features/tasks/types/tasks";
import { TaskActions } from "@/features/tasks/components/TaskActions";
import { TaskDueDate } from "@/features/tasks/components/TaskDueDate";
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
  const tMeta = useTranslations("tasks.meta");

  const isDone = task.status === "done";
  const canDelete = canManageTasks || task.authorId === currentUserId;

  const ownerText = isDone && task.assignee
    ? tMeta("completedBy", { name: task.assignee.displayName })
    : task.author
      ? tMeta("addedBy", { name: task.author.displayName })
      : undefined;

  const toggleAriaLabel = isDone
    ? tItem("reopenAria", { title: task.title })
    : tItem("completeAria", { title: task.title });

  const dueDateLabels = {
    completed: tDueDate("completed"),
    overdue: tDueDate("overdue"),
    dueToday: tDueDate("dueToday"),
    dueOn: tDueDate("dueOn"),
  };

  return (
    <li
      id={`task-${task.id}`}
      className="group border-b border-stone-200 last:border-b-0"
    >
      <div className="flex items-start gap-3 px-4 py-2.5 sm:px-5">
        <div className="shrink-0 pt-0.5 sm:pt-0">
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
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <h3
                className={`text-sm font-medium leading-5 ${getTaskTitleClassName(task.status)}`}
              >
                {task.title}
              </h3>

              {task.description && (
                <p className="mt-0.5 text-sm leading-5 text-stone-600">
                  {task.description}
                </p>
              )}

              <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1">
                {ownerText && (
                  <span className="text-[11px] text-stone-400">{ownerText}</span>
                )}

                {!isDone && (
                  <TaskDueDate
                    task={task}
                    locale={locale}
                    labels={dueDateLabels}
                  />
                )}
              </div>
            </div>

            <div className="ml-auto flex shrink-0 items-start self-start pt-0.5">
              <TaskActions
                task={task}
                canDelete={canDelete}
                onDelete={onDelete}
                deleteAriaLabel={tTasks("aria.deleteTask", {
                  title: task.title,
                })}
              />
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}
