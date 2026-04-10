"use client";

import { ShoppingItem as ShoppingItemComponent } from "./ShoppingItem";
import type { ShoppingItem } from "../types/shopping";
import { useTranslations } from "next-intl";
import { deleteShoppingItemAction } from "../server/actions";
import { useRouter } from "@/i18n/navigation";
import { useOptimisticRemoveList } from "@/shared/hooks/useOptimisticRemoveList";

interface ShoppingListProps {
  items: ShoppingItem[];
  canManageItems: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
}

export function ShoppingList({
  items,
  canManageItems,
  emptyTitle,
  emptyDescription,
}: ShoppingListProps) {
  const tEmpty = useTranslations("shopping.empty.pending");
  const tDelete = useTranslations("shopping.delete");
  const tCommon = useTranslations("common");
  const router = useRouter();

  const finalEmptyTitle = emptyTitle || tEmpty("title");
  const finalEmptyDescription = emptyDescription || tEmpty("description");

  const { items: displayItems, removeItem: handleDelete } =
    useOptimisticRemoveList({
      items,
      commitRemove: async (item) =>
        deleteShoppingItemAction({ itemId: item.id }),
      messages: {
        success: tDelete("success"),
        restored: tDelete("restored"),
        undo: tDelete("undo"),
        fallbackError: tCommon("error"),
      },
      onCommitSuccess: () => {
        router.refresh();
      },
    });

  if (displayItems.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-stone-200 bg-stone-50 px-5 py-8 text-center">
        <h3 className="text-sm font-semibold text-stone-900">
          {finalEmptyTitle}
        </h3>
        <p className="mt-1 text-sm text-stone-600">{finalEmptyDescription}</p>
      </div>
    );
  }

  return (
    <ul className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
      {displayItems.map((item, index) => (
        <ShoppingItemComponent
          key={item.id}
          item={item}
          canManageItems={canManageItems}
          onDelete={handleDelete}
          isLast={index === displayItems.length - 1}
        />
      ))}
    </ul>
  );
}
