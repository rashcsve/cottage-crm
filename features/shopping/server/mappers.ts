import type { ShoppingItem } from "../types/shopping";

type PersonRelation =
  | { display_name: string | null }
  | Array<{ display_name: string | null }>
  | null;

export interface ShoppingItemRow {
  id: number;
  title: string;
  is_checked: boolean;
  author_id: string;
  brought_by_id: string | null;
  created_at: string;
  author: PersonRelation;
  brought_by: PersonRelation;
}

export function mapShoppingItemRowToShoppingItem(
  row: ShoppingItemRow
): ShoppingItem {
  return {
    id: row.id,
    title: row.title,
    isChecked: row.is_checked,
    author: extractAuthorDisplayName(row.author),
    authorId: row.author_id,
    broughtBy: extractDisplayName(row.brought_by),
    broughtById: row.brought_by_id,
    createdAt: row.created_at,
  };
}

// Supabase can return one-to-one relations as arrays depending on the query.
function extractDisplayName(person: PersonRelation): string | null {
  return Array.isArray(person)
    ? person[0]?.display_name ?? null
    : person?.display_name ?? null;
}

function extractAuthorDisplayName(person: PersonRelation): string {
  const displayName = extractDisplayName(person);

  if (!displayName) {
    throw new Error("Invalid ShoppingItemRow: missing author display_name");
  }

  return displayName;
}
