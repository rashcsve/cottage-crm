"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/require-admin";
import {
  CreateTaskSchema,
  ToggleTaskSchema,
  DeleteTaskSchema,
  CreateTaskFormData,
} from "@/features/tasks/schemas";
import {
  type CreateTaskResult,
  type ToggleTaskResult,
  type DeleteTaskResult,
} from "@/features/tasks/types/actions.types";

/**
 * Create a new task with title and optional details.
 * Returns task ID on success.
 */
export async function addTaskAction(
  input: CreateTaskFormData
): Promise<CreateTaskResult> {
  try {
    const parsed = CreateTaskSchema.parse(input);
    console.log(parsed);

    const { supabase, userId } = await requireAdmin();

    const { data, error } = await supabase
      .from("tasks")
      .insert({
        title: parsed.title,
        description: parsed.description || null,
        status: "pending",
        priority: parsed.priority,
        author_id: userId,
        due_date: parsed.dueDate || null,
        completed_at: null,
      })
      .select("id")
      .single();

    if (error || !data) {
      console.error("Task insert error:", error);
      return { ok: false, error: "Nepodařilo se vytvořit úkol" };
    }

    revalidatePath("/tasks");

    return {
      ok: true,
      data: { id: data.id },
      message: "Úkol byl úspěšně vytvořen",
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldErrors: Record<string, string> = {};
      error.issues.forEach((issue) => {
        fieldErrors[issue.path.join(".")] = issue.message;
      });
      return { ok: false, error: "Validace selhala", fieldErrors };
    }

    return { ok: false, error: "Nepodařilo se vytvořit úkol" };
  }
}

/**
 * Toggle task status between pending and done.
 * Returns void on success (revalidates page).
 */
export async function toggleTaskAction(
  formData: FormData
): Promise<ToggleTaskResult> {
  try {
    // Parse and validate input
    const input = {
      taskId: Number(formData.get("taskId")),
      currentStatus: String(formData.get("currentStatus") ?? ""),
    };

    const parsed = ToggleTaskSchema.parse(input);

    const { supabase } = await requireAdmin();

    const nextStatus = parsed.currentStatus === "pending" ? "done" : "pending";

    const { error } = await supabase
      .from("tasks")
      .update({
        status: nextStatus,
        completed_at: nextStatus === "done" ? new Date().toISOString() : null,
      })
      .eq("id", parsed.taskId);

    if (error) {
      console.error("Task update error:", error);
      return { ok: false, error: "Failed to update task" };
    }

    revalidatePath("/tasks");

    return { ok: true, data: undefined };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        ok: false,
        error: error.issues[0]?.message ?? "Invalid input",
      };
    }

    console.error("Unexpected error in toggleTaskAction:", error);
    return { ok: false, error: "Failed to update task" };
  }
}

/**
 * Delete a task permanently.
 * Returns void on success (revalidates page).
 */
export async function deleteTaskAction(
  formData: FormData
): Promise<DeleteTaskResult> {
  try {
    // Parse and validate input
    const input = {
      taskId: Number(formData.get("taskId")),
    };

    const parsed = DeleteTaskSchema.parse(input);

    const { supabase } = await requireAdmin();

    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", parsed.taskId);

    if (error) {
      console.error("Task delete error:", error);
      return { ok: false, error: "Failed to delete task" };
    }

    revalidatePath("/tasks");

    return { ok: true, data: undefined };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        ok: false,
        error: error.issues[0]?.message ?? "Invalid input",
      };
    }

    console.error("Unexpected error in deleteTaskAction:", error);
    return { ok: false, error: "Failed to delete task" };
  }
}
