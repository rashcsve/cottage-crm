"use server";

import { createClient } from "@/lib/supabase/server";
import { mapShoppingItemRowToShoppingItem } from "./mappers";
import type { ShoppingItem } from "../types/shopping";

export async function getShoppingList(): Promise<ShoppingItem[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("shopping_items")
      .select(
        "id, title, is_checked, author, author_id, brought_by, brought_by_id, created_at"
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[getShoppingList] Supabase error:", error);
      throw new Error(`Failed to fetch shopping list: ${error.message}`);
    }

    if (!data) {
      return [];
    }

    return data.map(mapShoppingItemRowToShoppingItem);
  } catch (error) {
    console.error("[getShoppingList] Exception:", error);
    throw error;
  }
}

export async function getShoppingListSummary() {
  const items = await getShoppingList();

  return {
    all: items,
    pending: items.filter((item) => !item.isChecked),
    purchased: items.filter((item) => item.isChecked),
  };
}
