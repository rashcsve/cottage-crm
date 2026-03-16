"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/../lib/supabase/server";
import { ActionState } from "@/../lib/types/action-state";
import { Profile } from "@/../lib/types/profile";

async function requireAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Nejsi přihlášený/á.");

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, role, display_name")
    .eq("id", user.id)
    .single<Profile>();

  if (error || !profile) {
    throw new Error("Profil nebyl nalezen.");
  }

  if (profile.role !== "admin") throw new Error("Nemáš oprávnění k této akci.");

  return { supabase, userId: user.id, displayName: profile.display_name };
}

export async function addTaskAction(
  _prevState: ActionState,
  formData: FormData
) {
  const title = String(formData.get("title") ?? "").trim();

  if (!title) {
    return { ok: false, message: "Název úkolu je povinný." };
  }

  try {
    const { supabase, userId } = await requireAdmin();

    const { error } = await supabase.from("tasks").insert({
      title,
      status: "pending",
      author_id: userId,
    });
    console.log(error);

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
  } catch (e) {
    console.log(e);
    return {
      ok: false,
      message: "Nastala chyba při ukládání úkolu.",
    };
  }
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
