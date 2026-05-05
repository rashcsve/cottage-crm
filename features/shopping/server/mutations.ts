import "server-only";

import { SupabaseClient } from "@supabase/supabase-js";
import type {
  CreateShoppingItemInput,
  UpdateShoppingItemInput,
} from "../types/shopping";
import type { MutationResult } from "@/lib/types/mutations.types";

export async function createShoppingItem(
  supabase: SupabaseClient,
  userId: string,
  displayName: string,
  input: CreateShoppingItemInput
): Promise<MutationResult<{ id: number }>> {
  const { error, data } = await supabase
    .from("shopping_items")
    .insert({
      title: input.title,
      is_checked: false,
      author: displayName,
      author_id: userId,
      brought_by: null,
      brought_by_id: null,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[createShoppingItem] Supabase error:", error);
    return { ok: false, error: "databaseError" };
  }

  if (!data) {
    return { ok: false, error: "databaseError" };
  }

  return { ok: true, data: { id: data.id } };
}

export async function updateShoppingItem(
  supabase: SupabaseClient,
  userId: string,
  displayName: string,
  input: UpdateShoppingItemInput
): Promise<MutationResult<void>> {
  const { data, error } = await supabase
    .from("shopping_items")
    .update({
      is_checked: input.isChecked,
      brought_by: input.isChecked ? displayName : null,
      brought_by_id: input.isChecked ? userId : null,
    })
    .eq("id", input.id)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("[updateShoppingItem] Supabase error:", error);
    return { ok: false, error: "databaseError" };
  }

  if (!data) {
    return { ok: false, error: "notFound" };
  }

  return { ok: true, data: undefined };
}

export async function deleteShoppingItem(
  supabase: SupabaseClient,
  itemId: number
): Promise<MutationResult<void>> {
  const { data, error } = await supabase
    .from("shopping_items")
    .delete()
    .eq("id", itemId)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("[deleteShoppingItem] Supabase error:", error);
    return { ok: false, error: "databaseError" };
  }

  if (!data) {
    return { ok: false, error: "notFound" };
  }

  return { ok: true, data: undefined };
}
