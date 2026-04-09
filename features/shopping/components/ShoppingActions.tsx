import { Trash2 } from "lucide-react";
import type { ShoppingItem } from "../types/shopping";

interface ShoppingActionsProps {
  item: ShoppingItem;
  canManageItems: boolean;
  onDelete: (item: ShoppingItem) => void;
  deleteAriaLabel: string;
}

export function ShoppingActions({
  item,
  canManageItems,
  onDelete,
  deleteAriaLabel,
}: ShoppingActionsProps) {
  if (!canManageItems) return null;

  return (
    <button
      type="button"
      onClick={() => onDelete(item)}
      className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-500 transition hover:border-stone-300 hover:text-stone-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      aria-label={deleteAriaLabel}
    >
      <Trash2 className="h-4 w-4" aria-hidden="true" />
    </button>
  );
}
