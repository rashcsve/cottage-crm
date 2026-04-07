"use server";

import { getTranslations } from "next-intl/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import {
  createTaskSchema,
  ToggleTaskSchema,
  DeleteTaskSchema,
  type CreateTaskFormData,
  type DeleteTaskInput,
} from "@/features/tasks/schemas";
import type {
  CreateTaskResult,
  ToggleTaskResult,
  DeleteTaskResult,
} from "@/features/tasks/types/actions.types";
import {
  createTask,
  toggleTask,
  deleteTask,
} from "@/features/tasks/server/mutations";
import { revalidateTaskPaths } from "@/features/tasks/server/revalidation";
import { mapZodIssuesToFieldErrors } from "@/lib/utils/validation";
import { getCreateTaskSchemaMessages } from "@/features/tasks/utils/get-create-task-schema-messages";

export async function addTaskAction(
  input: CreateTaskFormData
): Promise<CreateTaskResult> {
  const t = await getTranslations("tasks.form");
  const schema = createTaskSchema(getCreateTaskSchemaMessages(t));
  const parsed = schema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      error: t("errors.invalidData"),
      fieldErrors: mapZodIssuesToFieldErrors(parsed.error.issues, t),
    };
  }

  try {
    const { supabase, userId } = await requireAdmin();
    const result = await createTask(supabase, userId, parsed.data);

    if (!result.ok) {
      return { ok: false, error: t(`errors.${result.error}`) };
    }

    revalidateTaskPaths();

    return {
      ok: true,
      data: result.data,
    };
  } catch (error) {
    console.error("[addTaskAction] Unexpected error:", error);

    return {
      ok: false,
      error: t("errors.unexpected"),
    };
  }
}

export async function toggleTaskAction(
  input: unknown
): Promise<ToggleTaskResult> {
  const t = await getTranslations("tasks.item");
  const parsed = ToggleTaskSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      error: t("errors.invalidData"),
    };
  }

  try {
    const { supabase, userId } = await requireAdmin();
    const result = await toggleTask(supabase, userId, parsed.data.taskId);

    if (!result.ok) {
      return { ok: false, error: t(`errors.${result.error}`) };
    }

    revalidateTaskPaths();

    return { ok: true, data: undefined };
  } catch (error) {
    console.error("[toggleTaskAction] Unexpected error:", error);

    return {
      ok: false,
      error: t("errors.unexpected"),
    };
  }
}

export async function deleteTaskAction(
  input: DeleteTaskInput
): Promise<DeleteTaskResult> {
  const t = await getTranslations("tasks.delete");
  const parsed = DeleteTaskSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      error: t("errors.invalidData"),
    };
  }

  try {
    const { supabase, userId } = await requireAdmin();
    const result = await deleteTask(supabase, userId, parsed.data.taskId);

    if (!result.ok) {
      return { ok: false, error: t(`errors.${result.error}`) };
    }

    revalidateTaskPaths();

    return { ok: true, data: undefined };
  } catch (error) {
    console.error("[deleteTaskAction] Unexpected error:", error);

    return {
      ok: false,
      error: t("errors.unexpected"),
    };
  }
}
