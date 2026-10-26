import type { Task } from "@/features/tasks/types/tasks";

interface TaskViewer {
  canManageTasks: boolean;
  currentUserId: string;
}

export function canModifyTask(
  task: Pick<Task, "authorId">,
  { canManageTasks, currentUserId }: TaskViewer,
): boolean {
  return canManageTasks || task.authorId === currentUserId;
}
