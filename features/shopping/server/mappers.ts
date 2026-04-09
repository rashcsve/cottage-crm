import type { ShoppingItem } from "../types/shopping";

/**
 * Database row type (from Supabase)
 */
export interface ShoppingItemRow {
  id: number;
  title: string;
  is_checked: boolean;
  author: string;
  author_id: string;
  brought_by: string | null;
  brought_by_id: string | null;
  created_at: string;
}

/**
 * Map database row to typed domain model
 * Ensures type safety at data boundary
 */
export function mapShoppingItemRowToShoppingItem(
  row: ShoppingItemRow
): ShoppingItem {
  return {
    id: row.id,
    title: row.title,
    is_checked: row.is_checked,
    author: row.author,
    author_id: row.author_id,
    brought_by: row.brought_by,
    brought_by_id: row.brought_by_id,
    created_at: row.created_at,
  };
}
