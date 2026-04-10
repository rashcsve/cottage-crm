import { SupabaseClient } from "@supabase/supabase-js";
import type { CreateTaskFormData } from "@/features/tasks/schemas";
import { MutationResult } from "@/lib/types/mutations.types";
import { isAdminRole } from "@/lib/auth/is-admin-role";
import { UserRole } from "@/lib/types/profile";

export async function createTask(
  supabase: SupabaseClient,
  userId: string,
  input: CreateTaskFormData
): Promise<MutationResult<{ id: number }>> {
  const { title, description, priority, dueDate } = input;

  const { data, error } = await supabase
    .from("tasks")
    .insert({
      title,
      description: description || null,
      status: "pending",
      priority: priority,
      author_id: userId,
      assignee_id: null,
      due_date: dueDate || null,
      completed_at: null,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[createTask] Supabase error:", error);
    return { ok: false, error: "databaseError" };
  }

  if (!data) {
    return { ok: false, error: "databaseError" };
  }

  return { ok: true, data: { id: data.id } };
}

export async function toggleTask(
  supabase: SupabaseClient,
  userId: string,
  taskId: number,
  userRole: UserRole
): Promise<MutationResult<void>> {
  const isAdmin = isAdminRole(userRole);

  const { data: task, error: fetchError } = await supabase
    .from("tasks")
    .select("status, author_id")
    .eq("id", taskId)
    .single();

  if (fetchError || !task) {
    console.error("[toggleTask] Fetch error:", fetchError);
    return { ok: false, error: "notFound" };
  }

  if (!isAdmin && task.author_id !== userId) {
    console.warn(
      `[toggleTask] Unauthorized: user ${userId} tried to toggle task ${taskId}`
    );
    return { ok: false, error: "unauthorized" };
  }

  const newStatus = task.status === "pending" ? "done" : "pending";
  const completedAt = newStatus === "done" ? new Date().toISOString() : null;
  // The current schema has no dedicated completed_by column, so we persist the
  // completer in assignee_id until task assignment becomes a separate feature.
  const completedBy = newStatus === "done" ? userId : null;

  const { error: updateError } = await supabase
    .from("tasks")
    .update({
      status: newStatus,
      completed_at: completedAt,
      assignee_id: completedBy,
      updated_at: new Date().toISOString(),
    })
    .eq("id", taskId);

  if (updateError) {
    console.error("[toggleTask] Update error:", updateError);
    return { ok: false, error: "databaseError" };
  }

  return { ok: true, data: undefined };
}

export async function deleteTask(
  supabase: SupabaseClient,
  userId: string,
  taskId: number,
  userRole: UserRole
): Promise<MutationResult<void>> {
  const isAdmin = isAdminRole(userRole);

  const { data: task, error: fetchError } = await supabase
    .from("tasks")
    .select("author_id")
    .eq("id", taskId)
    .single();

  if (fetchError || !task) {
    console.error("[deleteTask] Fetch error:", fetchError);
    return { ok: false, error: "notFound" };
  }

  if (!isAdmin && task.author_id !== userId) {
    console.warn(
      `[deleteTask] Unauthorized: user ${userId} tried to delete task ${taskId}`
    );
    return { ok: false, error: "unauthorized" };
  }

  const { error: deleteError } = await supabase
    .from("tasks")
    .delete()
    .eq("id", taskId);

  if (deleteError) {
    console.error("[deleteTask] Delete error:", deleteError);
    return { ok: false, error: "databaseError" };
  }

  return { ok: true, data: undefined };
}
