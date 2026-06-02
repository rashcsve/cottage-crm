import { Trash2 } from "lucide-react";
import type { ShoppingItem } from "../types/shopping";
import { IconButton } from "@/shared/ui/IconButton";

interface ShoppingActionsProps {
  item: ShoppingItem;
  canDelete: boolean;
  onDelete: (item: ShoppingItem) => void;
  deleteAriaLabel: string;
}

export function ShoppingActions({
  item,
  canDelete,
  onDelete,
  deleteAriaLabel,
}: ShoppingActionsProps) {
  if (!canDelete) return null;

  return (
    <IconButton
      type="button"
      onClick={() => onDelete(item)}
      aria-label={deleteAriaLabel}
    >
      <Trash2 className="h-4 w-4" aria-hidden="true" />
    </IconButton>
  );
}
