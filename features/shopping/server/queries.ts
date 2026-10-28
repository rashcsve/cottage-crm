import "server-only";

import { createClient } from "@/lib/supabase/server";
import { mapShoppingItemRowToShoppingItem } from "./mappers";
import type { ShoppingItem } from "../types/shopping";

const SHOPPING_SELECT_COLUMNS =
  "id, title, is_checked, author_id, brought_by_id, created_at, author:profiles!author_id (display_name), brought_by:profiles!brought_by_id (display_name)";

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

export async function getShoppingOverview(previewLimit: number): Promise<{
  pendingCount: number;
  purchasedCount: number;
  pendingItems: ShoppingItem[];
}> {
  try {
    const supabase = await createClient();

    const [pendingResult, purchasedCountResult] = await Promise.all([
      supabase
        .from("shopping_items")
        .select(SHOPPING_SELECT_COLUMNS, { count: "exact" })
        .eq("is_checked", false)
        .order("created_at", { ascending: false })
        .limit(previewLimit),
      supabase
        .from("shopping_items")
        .select("id", { count: "exact", head: true })
        .eq("is_checked", true),
    ]);

    const error = pendingResult.error ?? purchasedCountResult.error;

    if (error) {
      console.error("[getShoppingOverview] Supabase error:", error);
      throw new Error("Failed to fetch shopping list");
    }

    return {
      pendingCount: pendingResult.count ?? 0,
      purchasedCount: purchasedCountResult.count ?? 0,
      pendingItems:
        pendingResult.data?.map(mapShoppingItemRowToShoppingItem) ?? [],
    };
  } catch (error) {
    console.error("[getShoppingOverview] Exception:", error);
    throw error;
  }
}
