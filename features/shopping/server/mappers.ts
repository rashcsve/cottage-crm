import type { ShoppingItem } from "../types/shopping";

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

export function mapShoppingItemRowToShoppingItem(
  row: ShoppingItemRow
): ShoppingItem {
  return {
    id: row.id,
    title: row.title,
    isChecked: row.is_checked,
    author: row.author,
    authorId: row.author_id,
    broughtBy: row.brought_by,
    broughtById: row.brought_by_id,
    createdAt: row.created_at,
  };
}
