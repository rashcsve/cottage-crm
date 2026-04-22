import "server-only";

import { createClient } from "@/lib/supabase/server";
import { mapTaskRowToTask } from "@/features/tasks/server/mappers";
import type { Task } from "@/features/tasks/types/tasks";

const TASK_SELECT_COLUMNS = `
  id,
  title,
  description,
  status,
  priority,
  author_id,
  assignee_id,
  due_date,
  created_at,
  updated_at,
  completed_at,
  author:author_id (display_name),
  assignee:assignee_id (display_name)
`;

export async function getAllTasks(today: string): Promise<Task[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("tasks")
      .select(TASK_SELECT_COLUMNS)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[getAllTasks] Query failed:", error);
      throw new Error("Failed to fetch tasks");
    }

    return (data ?? []).map((row) => mapTaskRowToTask(row, today));
  } catch (error) {
    console.error("[getAllTasks] Error:", error);
    throw error;
  }
}
