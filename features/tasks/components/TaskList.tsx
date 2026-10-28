"use client";

import type { Task } from "@/features/tasks/types/tasks";
import { TaskItem } from "@/features/tasks/components/TaskItem";
import { useTranslations } from "next-intl";
import { EmptyState } from "@/shared/ui/EmptyState";
import { RowList } from "@/shared/ui/RowList";

interface TaskListProps {
  tasks: Task[];
  onDelete: (task: Task) => void;
  canManageTasks: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  currentUserId: string;
}

export function TaskList({
  tasks,
  onDelete,
  canManageTasks,
  emptyTitle,
  emptyDescription,
  currentUserId,
}: TaskListProps) {
  const tEmpty = useTranslations("tasks.empty");

  const finalEmptyTitle = emptyTitle ?? tEmpty("noTasks");
  const finalEmptyDescription =
    emptyDescription ?? tEmpty("noTasksDescription");

  const isEmpty = tasks.length === 0;

  return (
    <>
      <span className="sr-only" role="status">
        {isEmpty ? finalEmptyTitle : ""}
      </span>
      {isEmpty ? (
        <EmptyState
          title={finalEmptyTitle}
          description={finalEmptyDescription}
        />
      ) : (
        <RowList>
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              canManageTasks={canManageTasks}
              onDelete={onDelete}
              currentUserId={currentUserId}
            />
          ))}
        </RowList>
      )}
    </>
  );
}
