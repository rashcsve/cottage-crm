import { createClient } from "@/lib/supabase/server";
import { mapTaskRowToTask } from "@/features/tasks/server/mappers";
import type { Task } from "@/features/tasks/types/task.types";

/**
 * Base query to fetch all tasks.
 * Handles Supabase errors and authentication.
 *
 * @returns Array of tasks, or empty array on error
 * @throws Error with context if query fails
 */
export async function fetchTasks(): Promise<Task[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tasks")
    .select(
      `
      id,
      title,
      description,
      status,
      priority,
      author_id,
      assignee_id,
      due_date,
      created_at,
      visit_id,
      updated_at,
      completed_at,
      author:author_id (display_name),
      assignee:assignee_id (display_name)
      `
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch tasks: ${error.message}`);
  }

  if (!data) {
    return [];
  }

  return data.map(mapTaskRowToTask);
}
