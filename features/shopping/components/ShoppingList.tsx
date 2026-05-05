"use client";

import { ShoppingItem as ShoppingItemComponent } from "./ShoppingItem";
import type { ShoppingFilter, ShoppingItem } from "../types/shopping";
import { useTranslations } from "next-intl";
import { deleteShoppingItemAction } from "../server/actions";
import { useRouter } from "@/i18n/navigation";
import { useOptimisticRemoveList } from "@/shared/hooks/useOptimisticRemoveList";
import { EmptyState } from "@/shared/ui/EmptyState";

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
    return (
      <EmptyState
        title={finalEmptyTitle}
        description={finalEmptyDescription}
      />
    );
  }

  return (
    <ul className={variant === "plain" ? "space-y-2" : "space-y-2"}>
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
