import { TaskItem } from "./TaskItem";
import { Task } from "./types";

type TaskListProps = {
  tasks: Task[];
  canManageTasks: boolean;
};

export function TaskList({ tasks, canManageTasks }: TaskListProps) {
  if (tasks.length === 0) {
    return <p className="text-stone-500"> Zatím tu nejsou žádné úkoly.</p>;
  }

  return (
    <section className="space-y-3">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} canManageTasks={canManageTasks} />
      ))}
    </section>
  );
}
