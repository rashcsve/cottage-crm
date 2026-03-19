export type TaskStatus = "pending" | "done";

export interface Task {
  id: number;
  title: string;
  status: TaskStatus;
  author_id: string;
  author_name: string;
  created_at: string;
}
