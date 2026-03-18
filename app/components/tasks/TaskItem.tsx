import { InlineActions } from "@/app/components/ui/InlineActions";
import { ListRow } from "@/app/components/ui/ListRow";
import { MetaText } from "@/app/components/ui/MetaText";
import { StatusBadge } from "@/app/components/ui/StatusBadge";
import { TaskActions } from "@/app/components/tasks/TaskActions";
import { Task } from "@/app/components/tasks/types";

interface TaskItemProps {
  task: Task;
  canManageTasks: boolean;
}

export function TaskItem({ task, canManageTasks }: TaskItemProps) {
  const isDone = task.status === "done";

  return (
    <ListRow>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p
            className={
              isDone
                ? "text-base font-medium line-through text-stone-400"
                : "text-base font-medium text-stone-900"
            }
          >
            {task.title}
          </p>

          <MetaText className="mt-1">Přidal(a): {task.author_name}</MetaText>

          {canManageTasks && (
            <InlineActions>
              <TaskActions taskId={task.id} currentStatus={task.status} />
            </InlineActions>
          )}
        </div>

        <div className="shrink-0">
          <StatusBadge tone={isDone ? "success" : "warning"}>
            {isDone ? "Hotovo" : "Čeká"}
          </StatusBadge>
        </div>
      </div>
    </ListRow>
  );
}
