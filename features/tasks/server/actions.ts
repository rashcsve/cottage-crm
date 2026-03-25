"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getTranslations } from "next-intl/server";
import {
  CreateTaskSchema,
  ToggleTaskSchema,
  DeleteTaskSchema,
  type CreateTaskFormData,
  type DeleteTaskInput,
} from "@/features/tasks/schemas";
import {
  type CreateTaskResult,
  type ToggleTaskResult,
  type DeleteTaskResult,
} from "@/features/tasks/types/actions.types";

const TASKS_PATH = "/tasks";

function mapFieldErrors(issues: z.ZodError["issues"]): Record<string, string> {
  return Object.fromEntries(
    issues.map((issue) => [issue.path.join("."), issue.message])
  );
}

/**
 * Create a new task with title and optional details.
 * Returns task ID on success.
 */
export async function addTaskAction(
  input: CreateTaskFormData
): Promise<CreateTaskResult> {
  const t = await getTranslations("tasks.form");

  const parsed = CreateTaskSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      error: t("errors.invalidData"),
      fieldErrors: mapFieldErrors(parsed.error.issues),
    };
  }

  const { title, description, priority, dueDate } = parsed.data;

  try {
    const { supabase, userId } = await requireAdmin();

    const { data, error } = await supabase
      .from("tasks")
      .insert({
        title,
        description: description || null,
        status: "pending",
        priority,
        author_id: userId,
        due_date: dueDate || null,
        completed_at: null,
      })
      .select("id")
      .single();

    if (error || !data) {
      console.error("Task insert error:", error);
      return { ok: false, error: t("error") };
    }

    revalidatePath(TASKS_PATH);

    return {
      ok: true,
      data: { id: data.id },
      message: t("success"),
    };
  } catch (error) {
    console.error("Unexpected error in addTaskAction:", error);
    return { ok: false, error: t("error") };
  }
}

/**
 * Toggle task status between pending and done.
 * Returns void on success (revalidates page).
 */
export async function toggleTaskAction(
  input: unknown
): Promise<ToggleTaskResult> {
  const t = await getTranslations("tasks.toggle");
  const formT = await getTranslations("tasks.form");

  const parsed = ToggleTaskSchema.safeParse(input);
  console.log(parsed);

  if (!parsed.success) {
    return { ok: false, error: formT("errors.invalidData") };
  }

  try {
    const { supabase } = await requireAdmin();
    const { taskId } = parsed.data;

    const { data: task, error: fetchError } = await supabase
      .from("tasks")
      .select("id, status")
      .eq("id", taskId)
      .single();

    if (fetchError || !task) {
      return { ok: false, error: t("error") };
    }

    const isCompleting = task.status === "pending";
    const nextStatus = isCompleting ? "done" : "pending";

    const { error: updateError } = await supabase
      .from("tasks")
      .update({
        status: nextStatus,
        completed_at: isCompleting ? new Date().toISOString() : null,
      })
      .eq("id", task.id);

    if (updateError) {
      console.error("Task update error:", updateError);
      return { ok: false, error: t("error") };
    }

    revalidatePath(TASKS_PATH);

    return { ok: true, data: undefined };
  } catch (error) {
    console.error("Unexpected error in toggleTaskAction:", error);
    return { ok: false, error: t("error") };
  }
}

/**
 * Delete a task permanently.
 * Returns void on success (revalidates page).
 */
export async function deleteTaskAction(
  input: DeleteTaskInput
): Promise<DeleteTaskResult> {
  const t = await getTranslations("tasks.delete");

  const parsed = DeleteTaskSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? t("error"),
    };
  }

  try {
    const { supabase } = await requireAdmin();
    const { taskId } = parsed.data;

    const { error } = await supabase.from("tasks").delete().eq("id", taskId);

    if (error) {
      console.error("Task delete error:", error);
      return { ok: false, error: t("error") };
    }

    revalidatePath(TASKS_PATH);

    return { ok: true, data: undefined };
  } catch (error) {
    console.error("Unexpected error in deleteTaskAction:", error);
    return { ok: false, error: t("error") };
  }
}
