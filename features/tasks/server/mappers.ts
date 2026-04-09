import type {
  Task,
  TaskPerson,
  TaskPriority,
  TaskStatus,
} from "@/features/tasks/types/tasks";
import { deriveTaskDueKind } from "../domain/predicates";

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
 * Maps a raw task row to the task domain model.
 *
 * Handles:
 * - Supabase column naming (snake_case → camelCase)
 * - Person relations that may return object or array
 * - Null handling for optional fields
 *
 * @param row Raw Supabase row
 * @param today ISO date string (YYYY-MM-DD) from server
 * @returns Domain Task object
 * @throws If row is missing required fields
 */
export function mapTaskRowToTask(row: TaskRow, today: string): Task {
  if (row.id == null || row.title == null) {
    throw new Error("Invalid TaskRow: missing required fields");
  }

  const todayDate = new Date(`${today}T00:00:00Z`);

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status,
    priority: row.priority ?? "medium",
    dueDate: row.due_date,
    dueKind: deriveTaskDueKind(row.due_date, row.status, todayDate) ?? "dueOn",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    completedAt: row.completed_at,
    author: extractPerson(row.author),
    assignee: extractPerson(row.assignee),
    authorId: row.author_id,
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

  // Supabase can return one-to-one relations as arrays depending on the query.
  const displayName = Array.isArray(person)
    ? person[0]?.display_name ?? null
    : person.display_name ?? null;

  return displayName ? { displayName } : null;
}
