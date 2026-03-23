"use server";

import { revalidatePath } from "next/cache";
import { ActionState } from "@/lib/types/action-state";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getOptionalDate, getOptionalString } from "@/lib/utils/form";
import { getCategory, getPriority } from "@/features/tasks/lib/utils";
import { TaskStatus } from "@/features/tasks/types/task.types";

export async function addTaskAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const title = String(formData.get("title") ?? "").trim();

  if (!title) {
    return { ok: false, message: "Název úkolu je povinný." };
  }

  try {
    const { supabase, userId } = await requireAdmin();

    const { error } = await supabase.from("tasks").insert({
      title,
      description: getOptionalString(formData, "description"),
      status: "pending" satisfies TaskStatus,
      priority: getPriority(formData),
      category: getCategory(formData),
      author_id: userId,
      assignee_id: getOptionalString(formData, "assignee_id"),
      due_date: getOptionalDate(formData, "due_date"),
      visit_id: null,
      completed_at: null,
    });

    if (error) {
      return {
        ok: false,
        message: "Úkol se nepodařilo uložit.",
      };
    }

    revalidatePath("/tasks");

    return {
      ok: true,
      message: "Úkol byl přidán.",
    };
  } catch {
    return {
      ok: false,
      message: "Nastala chyba při ukládání úkolu.",
    };
  }
}

export async function toggleTaskAction(
  formData: FormData
): Promise<void> {
  const { supabase } = await requireAdmin();

  const taskId = Number(formData.get("taskId"));
  const currentStatusRaw = String(formData.get("currentStatus") ?? "");

  if (!Number.isInteger(taskId) || taskId <= 0) {
    throw new Error("Neplatné ID úkolu.");
  }
  if (currentStatusRaw !== "pending" && currentStatusRaw !== "done") {
    throw new Error("Neplatný stav úkolu.");
  }

  const currentStatus = currentStatusRaw as TaskStatus;
  const nextStatus = currentStatus === "pending" ? "done" : "pending";

  const { error } = await supabase
    .from("tasks")
    .update({
      status: nextStatus,
      completed_at: nextStatus === "done" ? new Date().toISOString() : null,
    })
    .eq("id", taskId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/tasks");
}

export async function deleteTaskAction(formData: FormData): Promise<void> {
  const { supabase } = await requireAdmin();

  const taskId = Number(formData.get("taskId"));
  if (!Number.isInteger(taskId) || taskId <= 0) {
    throw new Error("Neplatné ID úkolu.");
  }

  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", taskId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/tasks");
}
