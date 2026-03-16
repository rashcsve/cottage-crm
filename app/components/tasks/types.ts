export type TaskStatus = "pending" | "done";

export interface Task {
  id: number;
  title: string;
  status: TaskStatus;
  author: string;
}
