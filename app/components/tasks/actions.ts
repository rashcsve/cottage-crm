"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "../../../lib/supabase/server";

async function requireAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Nejsi přihlášený/á.");

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    throw new Error("Profil nebyl nalezen.");
  }

  if (profile.role !== "admin") throw new Error("Nemáš oprávnění k této akci.");

  return { supabase, userId: user.id };
}

export async function addTaskAction(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;

  const { supabase, userId } = await requireAdmin();

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", userId)
    .single();

  if (profileError || !profile) {
    throw new Error("Nepodařilo se načíst jméno autora.");
  }

  const { error } = await supabase.from("tasks").insert({
    title,
    status: "pending",
    author_id: userId,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/tasks");
}

export async function toggleTaskAction(
  taskId: number,
  currentStatus: "pending" | "done"
) {
  const { supabase } = await requireAdmin();

  const nextStatus = currentStatus === "pending" ? "done" : "pending";

  const { error } = await supabase
    .from("tasks")
    .update({ status: nextStatus })
    .eq("id", taskId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/tasks");
}

export async function deleteTaskAction(taskId: number) {
  const { supabase } = await requireAdmin();

  const { error } = await supabase.from("tasks").delete().eq("id", taskId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/tasks");
}
