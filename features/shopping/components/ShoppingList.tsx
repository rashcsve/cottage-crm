"use client";

import { ShoppingItem as ShoppingItemComponent } from "./ShoppingItem";
import type { ShoppingFilter, ShoppingItem } from "../types/shopping";
import { useTranslations } from "next-intl";
import { deleteShoppingItemAction } from "../server/actions";
import { useRouter } from "@/i18n/navigation";
import { useOptimisticRemoveList } from "@/shared/hooks/useOptimisticRemoveList";

interface ShoppingListProps {
  items: ShoppingItem[];
  canManageItems: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  variant?: "card" | "plain";
  view: ShoppingFilter;
}

export function ShoppingList({
  items,
  canManageItems,
  emptyTitle,
  emptyDescription,
  variant = "card",
  view,
}: ShoppingListProps) {
  const tEmpty = useTranslations(
    view === "purchased" ? "shopping.empty.purchased" : "shopping.empty.pending",
  );
  const tDelete = useTranslations("shopping.delete");
  const tCommon = useTranslations("common");
  const router = useRouter();

  const finalEmptyTitle = emptyTitle ?? tEmpty("title");
  const finalEmptyDescription = emptyDescription ?? tEmpty("description");

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
    const emptyStateClassName =
      variant === "plain"
        ? "rounded-2xl border border-dashed border-stone-200 bg-white px-5 py-8 text-center"
        : "rounded-2xl border border-dashed border-stone-200 bg-white px-5 py-8 text-center";

    return (
      <div className={emptyStateClassName}>
        <h3 className="text-sm font-semibold text-stone-900">
          {finalEmptyTitle}
        </h3>
        <p className="mt-1 text-sm text-stone-600">{finalEmptyDescription}</p>
      </div>
    );
  }

  return (
    <ul
      className={
        variant === "plain"
          ? "space-y-2.5 sm:space-y-3"
          : "space-y-2.5 sm:space-y-3"
      }
    >
      {displayItems.map((item) => (
        <ShoppingItemComponent
          key={item.id}
          item={item}
          view={view}
          canManageItems={canManageItems}
          onDelete={handleDelete}
        />
      ))}
    </ul>
  );
}
