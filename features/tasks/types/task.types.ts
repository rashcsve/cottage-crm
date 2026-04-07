export type TaskStatus = "pending" | "done";
export type TaskPriority = "low" | "medium" | "high";
export type TaskDueKind = "completed" | "overdue" | "dueToday" | "dueOn";
export type TaskFilter = "pending" | "overdue" | "done";

export interface TaskPerson {
  displayName: string;
}

/**
 * Raw Supabase row - use only for mapping
 */
export interface TaskRow {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority | null;
  author_id: string;
  assignee_id: string | null;
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

/**
 * Domain task - use everywhere else
 */
export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  author: TaskPerson | null;
  assignee: TaskPerson | null;
}

/**
 * Data grouped by filter, with global counts
 * - All counts are global (not filtered)
 * - Filtered arrays only contain tasks matching that filter
 * - Done tasks are sorted by completion time (newest first)
 */
export interface TaskData {
  pendingCount: number;
  pendingTasks: Task[];
  overdueCount: number;
  overdueTasks: Task[];
  doneCount: number;
  doneTasks: Task[];
}

/**
 * Complete page data with metadata
 */
export interface TasksPageData extends TaskData {
  canManage: boolean;
  totalCount: number;
  completionRate: number;
}

/**
 * Minimal list config - used by page to render sections
 */
export interface TaskListInfo {
  count: number;
  tasks: Task[];
}
