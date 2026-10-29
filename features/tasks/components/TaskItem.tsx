"use client";

import { Check } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { TaskActions } from "@/features/tasks/components/TaskActions";
import { TaskDueDate } from "@/features/tasks/components/TaskDueDate";
import { TaskNoteDisclosure } from "@/features/tasks/components/TaskNoteDisclosure";
import { TaskToggleButton } from "@/features/tasks/components/TaskToggleButton";
import { canModifyTask } from "@/features/tasks/domain/permissions";
import type { Task } from "@/features/tasks/types/tasks";
import { RelativeTime } from "@/shared/ui/ItemByline";
import { RowListActions, RowListItem } from "@/shared/ui/RowList";
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

  return (
    <RowListItem
      id={`task-${task.id}`}
      density="compact"
      className="group relative scroll-mt-24 sm:items-start"
    >
      <div className="-ml-2.5 shrink-0">
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

      <div className="grid min-h-11 min-w-0 flex-1 grid-cols-[1fr_auto] content-center items-center gap-x-2 gap-y-0.5 sm:flex sm:flex-wrap sm:items-start sm:gap-x-3">
        <h4
          className={`min-w-0 flex-1 basis-40 text-sm leading-5 font-semibold sm:py-2.5 sm:text-base sm:leading-6 ${
            isDone ? "text-ink-muted line-through" : "text-ink-primary"
          }`}
        >
          {task.title}
        </h4>

        <div className="col-start-1 flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-secondary sm:min-h-11">
          {isDone ? (
            <StatusLabel tone="neutral" icon={Check}>
              {task.assignee
                ? t("meta.completedBy", { name: task.assignee.displayName })
                : t("meta.completed")}{" "}
              <span aria-hidden="true">·</span>{" "}
              <RelativeTime
                dateTime={task.completedAt ?? task.updatedAt}
                locale={locale}
              />
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
              {task.assignee ? (
                <span>
                  {t("meta.assignedTo", { name: task.assignee.displayName })}
                </span>
              ) : null}
            </>
          )}
          {task.description ? (
            <TaskNoteDisclosure
              description={task.description}
              label={t("item.note")}
              ariaLabel={t("item.noteAria", { title: task.title })}
            />
          ) : null}
        </div>

        {canModify ? (
          <RowListActions className="col-start-2 row-span-2 row-start-1">
            <TaskActions
              deleteAriaLabel={t("aria.deleteTask", { title: task.title })}
              onDelete={() => onDelete(task)}
            />
          </RowListActions>
        ) : null}
      </div>
    </RowListItem>
  );
}
