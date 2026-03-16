import { TaskActions } from "./TaskActions";
import { Task } from "./types";

type TaskItemProps = {
  task: Task;
  canManageTasks: boolean;
};

export function TaskItem({ task, canManageTasks }: TaskItemProps) {
  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h4
          className={
            task.status === "done"
              ? "text-lg font-semibold line-through text-stone-400"
              : "text-lg font-semibold text-stone-800"
          }
        >
          {task.title}
        </h4>

        <p className="mt-1 text-sm text-stone-500">
          Přidal(a): {task.author_name}
        </p>
      </div>

      {canManageTasks && (
        <TaskActions taskId={task.id} currentStatus={task.status} />
      )}
    </article>
  );
}
