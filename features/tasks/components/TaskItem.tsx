"use client";

import { useLocale, useTranslations } from "next-intl";
import { TaskActions } from "@/features/tasks/components/TaskActions";
import { TaskDueDate } from "@/features/tasks/components/TaskDueDate";
import { TaskToggleButton } from "@/features/tasks/components/TaskToggleButton";
import { formatTaskTimestamp } from "@/features/tasks/shared/formatTaskDate";
import type { Task, TaskStatus } from "@/features/tasks/types/tasks";

interface TaskItemProps {
  task: Task;
  canManageTasks: boolean;
  onDelete: (task: Task) => void;
  currentUserId: string;
}

function getTaskTitleClassName(status: TaskStatus): string {
  return status === "done"
    ? "text-stone-500 line-through decoration-stone-300"
    : "text-stone-900";
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
  const assigneeText =
    !isDone && task.assignee
      ? tMeta("assignedTo", { name: task.assignee.displayName })
      : undefined;

  const ownerText =
    isDone && task.assignee
      ? tMeta("completedBy", { name: task.assignee.displayName })
      : task.author
      ? tMeta("addedBy", { name: task.author.displayName })
      : undefined;

  const timestamp = isDone
    ? task.completedAt ?? task.updatedAt
    : task.createdAt;
  const timestampLabel = timestamp
    ? formatTaskTimestamp(timestamp, locale)
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
    <li id={`task-${task.id}`} className="group scroll-mt-24">
      <article className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm transition-colors group-hover:border-stone-300">
        <div className="flex items-start gap-3">
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
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
              <div className="min-w-0 flex-1 space-y-2.5">
                <div className="space-y-2">
                  <h3
                    className={`text-sm font-semibold leading-6 ${getTaskTitleClassName(
                      task.status
                    )}`}
                  >
                    {task.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-2">
                    {!isDone ? (
                      <TaskDueDate
                        task={task}
                        locale={locale}
                        labels={dueDateLabels}
                      />
                    ) : null}

                    {assigneeText ? (
                      <span className="inline-flex rounded-full bg-stone-100 px-2.5 py-1 text-[11px] font-medium text-stone-600">
                        {assigneeText}
                      </span>
                    ) : null}
                  </div>
                </div>

                {task.description ? (
                  <p className="whitespace-pre-wrap wrap-break-word text-sm leading-6 text-stone-600">
                    {task.description}
                  </p>
                ) : null}

                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                  {ownerText ? (
                    <span className="text-[11px] font-medium text-stone-500">
                      {ownerText}
                    </span>
                  ) : null}

                  {timestampLabel ? (
                    <time
                      dateTime={timestamp}
                      className="text-[11px] text-stone-400"
                    >
                      {timestampLabel}
                    </time>
                  ) : null}
                </div>
              </div>

              {canDelete ? (
                <div className="flex shrink-0 justify-end self-start sm:ml-auto">
                  <TaskActions
                    task={task}
                    canDelete={canDelete}
                    onDelete={onDelete}
                    deleteAriaLabel={tTasks("aria.deleteTask", {
                      title: task.title,
                    })}
                  />
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </article>
    </li>
  );
}
