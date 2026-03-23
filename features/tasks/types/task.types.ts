export type TaskStatus = "pending" | "done";
export type TaskPriority = "low" | "medium" | "high";
export type TaskCategory =
  | "inside"
  | "outside"
  | "maintenance"
  | "shopping"
  | "cleaning"
  | "other";

export interface TaskPerson {
  displayName: string | null;
}

export interface TaskRow {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority | null;
  category: TaskCategory | null;
  author_id: string;
  assignee_id: string | null;
  visit_id: string | null;
  due_date: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  author:
    | { display_name: string | null }
    | Array<{ display_name: string | null }>
    | null;
  assignee:
    | { display_name: string | null }
    | Array<{ display_name: string | null }>
    | null;
}

export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  category: TaskCategory | null;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  author: TaskPerson | null;
  assignee: TaskPerson | null;
}

export type TaskFilter = "pending" | "overdue" | "done";

export interface TaskData {
  pendingCount: number;
  pendingTasks: Task[];
  overdueCount: number;
  overdueTasks: Task[];
  doneCount: number;
  recentDoneTasks: Task[];
}
