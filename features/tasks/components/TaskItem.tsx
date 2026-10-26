"use client";

import { Check } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { TaskActions } from "@/features/tasks/components/TaskActions";
import { TaskDueDate } from "@/features/tasks/components/TaskDueDate";
import { TaskToggleButton } from "@/features/tasks/components/TaskToggleButton";
import { canModifyTask } from "@/features/tasks/domain/permissions";
import { formatTaskTimestamp } from "@/features/tasks/shared/formatTaskDate";
import type { Task } from "@/features/tasks/types/tasks";
import { RowListItem } from "@/shared/ui/RowList";
import { StatusLabel } from "@/shared/ui/StatusLabel";

interface TaskItemProps {
  task: Task;
  canManageTasks: boolean;
  onDelete: (task: Task) => void;
  currentUserId: string;
}

export function TaskItem({
  task,
  canManageTasks,
  onDelete,
  currentUserId,
}: TaskItemProps) {
  const locale = useLocale();
  const t = useTranslations("tasks");

  const isDone = task.status === "done";
  const canModify = canModifyTask(task, { canManageTasks, currentUserId });

  const timestamp = isDone
    ? task.completedAt ?? task.updatedAt
    : task.createdAt;
  const time = (
    <time dateTime={timestamp} className="font-mono font-normal text-ink-muted">
      {formatTaskTimestamp(timestamp, locale)}
    </time>
  );

  return (
    <RowListItem id={`task-${task.id}`} className="group scroll-mt-24 items-start">
      <div className="shrink-0">
        <TaskToggleButton
          taskId={task.id}
          isDone={isDone}
          canToggle={canModify}
          ariaLabel={t(isDone ? "item.reopenAria" : "item.completeAria", {
            title: task.title,
          })}
          readOnlyStateLabel={t(isDone ? "item.stateDone" : "item.stateOpen")}
          errorMessage={t("item.toggleError")}
        />
      </div>

      <div className="min-w-0 flex-1 space-y-1.5 pt-2.5">
        <h4
          className={`text-base font-semibold ${
            isDone ? "text-ink-muted line-through" : "text-ink-primary"
          }`}
        >
          {task.title}
        </h4>

        <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1 text-xs text-ink-secondary">
          {isDone ? (
            <StatusLabel tone="neutral" icon={Check}>
              {task.assignee
                ? t("meta.completedBy", { name: task.assignee.displayName })
                : t("meta.completed")}{" "}
              {time}
            </StatusLabel>
          ) : (
            <>
              <TaskDueDate
                task={task}
                locale={locale}
                labels={{
                  completed: t("dueDate.completed"),
                  overdue: t("dueDate.overdue"),
                  dueToday: t("dueDate.dueToday"),
                  dueOn: t("dueDate.dueOn"),
                }}
              />
              <span>{t(`priorityLabel.${task.priority}`)}</span>
              {task.assignee ? (
                <span>
                  {t("meta.assignedTo", { name: task.assignee.displayName })}
                </span>
              ) : null}
              <span>
                {task.author
                  ? t("meta.addedBy", { name: task.author.displayName })
                  : t("meta.added")}{" "}
                {time}
              </span>
            </>
          )}
        </div>

        {task.description ? (
          <p className="whitespace-pre-wrap wrap-break-word text-sm text-ink-secondary">
            {task.description}
          </p>
        ) : null}
      </div>

      {canModify ? (
        <div className="shrink-0 transition-opacity [@media(hover:hover)]:opacity-0 group-hover:opacity-100 group-focus-within:opacity-100">
          <TaskActions
            deleteAriaLabel={t("aria.deleteTask", { title: task.title })}
            onDelete={() => onDelete(task)}
          />
        </div>
      ) : null}
    </RowListItem>
  );
}
