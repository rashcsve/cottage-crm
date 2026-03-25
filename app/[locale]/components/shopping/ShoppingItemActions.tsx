"use client";

import { ActionButton } from "@/shared/ui/ActionButton";
import {
  toggleShoppingItemAction,
  deleteShoppingItemAction,
} from "@/app/[locale]/(dashboard)/shopping/actions";

interface ShoppingItemActionProps {
  itemId: number;
  isChecked: boolean;
}

export function ShoppingItemActions({
  itemId,
  isChecked,
}: ShoppingItemActionProps) {
  return (
    <div className="mt-3 flex flex-wrap gap-3">
      <form action={toggleShoppingItemAction.bind(null, itemId, isChecked)}>
        <ActionButton>
          {isChecked ? "Vrátit mezi chybějící" : "Označit jako vyřešené"}
        </ActionButton>
      </form>

      <form action={deleteShoppingItemAction.bind(null, itemId)}>
        <ActionButton tone="danger">Smazat</ActionButton>
      </form>
    </div>
  );
}
