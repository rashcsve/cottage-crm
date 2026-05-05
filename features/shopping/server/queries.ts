import "server-only";

import { createClient } from "@/lib/supabase/server";
import { mapShoppingItemRowToShoppingItem } from "./mappers";
import type { ShoppingItem } from "../types/shopping";

const SHOPPING_SELECT_COLUMNS =
  "id, title, is_checked, author, author_id, brought_by, brought_by_id, created_at";

export async function getAllShoppingItems(): Promise<ShoppingItem[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("shopping_items")
      .select(SHOPPING_SELECT_COLUMNS)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[getAllShoppingItems] Supabase error:", error);
      throw new Error("Failed to fetch shopping list");
    }

    return data?.map(mapShoppingItemRowToShoppingItem) ?? [];
  } catch (error) {
    console.error("[getAllShoppingItems] Exception:", error);
    throw error;
  }
}
