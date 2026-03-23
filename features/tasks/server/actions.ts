"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getOptionalDate, getOptionalString } from "@/lib/utils/form";
import {
  CreateTaskSchema,
  ToggleTaskSchema,
  DeleteTaskSchema,
} from "@/features/tasks/lib/validation";
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
  _prevState: unknown,
  formData: FormData
): Promise<CreateTaskResult> {
  try {
    // Parse and validate input
    const input = {
      title: String(formData.get("title") ?? "").trim(),
      description: getOptionalString(formData, "description"),
      priority: String(formData.get("priority") ?? "medium"),
      dueDate: getOptionalDate(formData, "due_date"),
    };

    const parsed = CreateTaskSchema.parse(input);

    const { supabase, userId } = await requireAdmin();

    const { data, error } = await supabase
      .from("tasks")
      .insert({
        title: parsed.title,
        description: parsed.description ?? null,
        status: "pending",
        priority: parsed.priority,
        author_id: userId,
        due_date: parsed.dueDate ?? null,
        visit_id: null,
        completed_at: null,
      })
      .select("id")
      .single();

    if (error || !data) {
      console.error("Task insert error:", error);
      return { ok: false, error: "Failed to create task" };
    }

    revalidatePath("/tasks");

    return {
      ok: true,
      data: { id: data.id },
      message: "Task created successfully",
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        ok: false,
        error: error.issues[0]?.message ?? "Invalid input",
      };
    }

    console.error("Unexpected error in addTaskAction:", error);
    return { ok: false, error: "Failed to create task" };
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
