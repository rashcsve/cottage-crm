import { Task } from "@/features/tasks/types/task.types";
import { TaskItem } from "./TaskItem";

interface TaskListProps {
  tasks: Task[];
  canManageTasks: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
}

export function TaskList({
  tasks,
  canManageTasks,
  emptyTitle = "Nic tu není",
  emptyDescription = "Tahle sekce je teď prázdná.",
}: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-stone-200 bg-stone-50 px-5 py-8 text-center">
        <h3 className="text-sm font-semibold text-stone-900">{emptyTitle}</h3>
        <p className="mt-1 text-sm text-stone-600">{emptyDescription}</p>
      </div>
    );
  }

  return (
    <ul className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} canManageTasks={canManageTasks} />
      ))}
    </ul>
  );
}

