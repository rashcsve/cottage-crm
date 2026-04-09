export type TaskStatus = "pending" | "done";
export type TaskPriority = "low" | "medium" | "high";
export type TaskDueKind = "completed" | "overdue" | "dueToday" | "dueOn";
export type TaskFilter = "pending" | "overdue" | "done";

export interface TaskPerson {
  displayName: string;
}

export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  dueKind: TaskDueKind;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  author: TaskPerson | null;
  assignee: TaskPerson | null;
  authorId: string;
}

/**
 * Task collections grouped by filter, with global counts.
 * - All counts are global (not filtered)
 * - Filtered arrays only contain tasks matching that filter
 * - Done tasks are sorted by completion time (newest first)
 */
export interface CategorizedTasks {
  pendingCount: number;
  pendingTasks: Task[];
  overdueCount: number;
  overdueTasks: Task[];
  doneCount: number;
  doneTasks: Task[];
}

export interface TasksPageData extends CategorizedTasks {
  canManage: boolean;
  totalCount: number;
  completionRate: number;
  today: string;
}
