"use server";

import { requireAdmin } from "@/lib/auth/require-admin";
import type { ActionState } from "@/lib/types/actions.types";
import { revalidatePath } from "next/cache";

export async function addNoteAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const content = String(formData.get("content") ?? "").trim();

  if (!content) {
    return {
      ok: false,
      message: "Text poznámky je povinný.",
    };
  }

  try {
    const { supabase, userId, displayName } = await requireAdmin();

    const { error } = await supabase.from("notes").insert({
      content,
      author: displayName,
      author_id: userId,
    });

    if (error) {
      return {
        ok: false,
        message: "Poznámku se nepodařilo uložit.",
      };
    }

    revalidatePath("/notes");

    return {
      ok: true,
      message: "Poznámka byla přidána.",
    };
  } catch {
    return {
      ok: false,
      message: "Nastala chyba při ukládání poznámky.",
    };
  }
}

export async function deleteNoteAction(noteId: number) {
  const { supabase } = await requireAdmin();

  const { error } = await supabase.from("notes").delete().eq("id", noteId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/notes");
}
