import { TaskItem } from "./TaskItem";
import { Task } from "../../../features/tasks/types/task.types";

type TaskListProps = {
  tasks: Task[];
  canManageTasks: boolean;
};

export function TaskList({ tasks, canManageTasks }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-stone-200 bg-stone-50 px-4 py-5 text-sm text-stone-500">
        Zatím tu nejsou žádné úkoly.
      </div>
    );
  }

  return (
    <section className="space-y-3">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} canManageTasks={canManageTasks} />
      ))}
    </section>
  );
}
