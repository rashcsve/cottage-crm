export type TaskStatus = "pending" | "done";
export type TaskPriority = "low" | "medium" | "high";
export type TaskDueKind = "completed" | "overdue" | "dueToday" | "dueOn";
export type TaskFilter = "open" | "done";

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
  dueKind: TaskDueKind | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  author: TaskPerson | null;
  assignee: TaskPerson | null;
  authorId: string;
}

export interface CategorizedTasks {
  openCount: number;
  openTasks: Task[];
  overdueCount: number;
  overdueTasks: Task[];
  onTrackCount: number;
  onTrackTasks: Task[];
  doneCount: number;
  doneTasks: Task[];
}

export interface TasksPageData extends CategorizedTasks {
  canManage: boolean;
  currentUserId: string;
}
