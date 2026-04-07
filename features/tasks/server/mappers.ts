import { Task, TaskPerson, TaskRow } from "@/features/tasks/types/task.types";

/**
 * Maps raw Supabase TaskRow to domain Task model.
 *
 * Handles:
 * - Supabase column naming (snake_case → camelCase)
 * - Person relations that may return object or array
 * - Null handling for optional fields
 *
 * @param row Raw Supabase row
 * @returns Domain Task object
 * @throws If row is missing required fields
 */
export function mapTaskRowToTask(row: TaskRow): Task {
  if (row.id == null || row.title == null) {
    throw new Error("Invalid TaskRow: missing required fields");
  }

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status,
    priority: row.priority ?? "medium",
    dueDate: row.due_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    completedAt: row.completed_at,
    author: extractPerson(row.author),
    assignee: extractPerson(row.assignee),
  };
}

/**
 * Extracts person display name from Supabase relation.
 * Handles both object and array returns (Supabase quirk).
 *
 * @param person Object, array, or null from Supabase
 * @returns Person with displayName or null
 */
function extractPerson(
  person: TaskRow["author"] | TaskRow["assignee"]
): TaskPerson | null {
  if (!person) {
    return null;
  }

  // Supabase sometimes returns relations as array TODO
  const displayName = Array.isArray(person)
    ? person[0]?.display_name ?? null
    : person.display_name ?? null;

  return displayName ? { displayName } : null;
}
