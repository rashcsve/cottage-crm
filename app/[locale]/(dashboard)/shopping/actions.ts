"use server";

import { requireAdmin } from "@/lib/auth/require-admin";
import { ActionState } from "@/lib/types/actions.types";
import { revalidatePath } from "next/cache";

export async function addShoppingItemAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const title = String(formData.get("title") ?? "").trim();

  if (!title) {
    return {
      ok: false,
      message: "Název položky je povinný.",
    };
  }

  try {
    const { supabase, userId, displayName } = await requireAdmin();
    const { error } = await supabase.from("shopping_items").insert({
      title,
      is_checked: false,
      author: displayName,
      author_id: userId,
      brought_by: null,
      brought_by_id: null,
    });

    if (error) {
      return {
        ok: false,
        message: "Položku se nepodařilo uložit.",
      };
    }

    revalidatePath("/shopping");

    return {
      ok: true,
      message: "Položka byla přidána.",
    };
  } catch {
    return {
      ok: false,
      message: "Nastala chyba při ukládání položky.",
    };
  }
}

export async function toggleShoppingItemAction(
  itemId: number,
  currentChecked: boolean
) {
  const { supabase, userId, displayName } = await requireAdmin();

  const nextChecked = !currentChecked;

  const { error } = await supabase
    .from("shopping_items")
    .update({
      is_checked: nextChecked,
      brought_by: nextChecked ? displayName : null,
      brought_by_id: nextChecked ? userId : null,
    })
    .eq("id", itemId);

  if (error) throw new Error(error.message);

  revalidatePath("/shopping");
}

export async function deleteShoppingItemAction(itemId: number) {
  const { supabase } = await requireAdmin();

  const { error } = await supabase
    .from("shopping_items")
    .delete()
    .eq("id", itemId);

  if (error) throw new Error(error.message);

  revalidatePath("/shopping");
}
