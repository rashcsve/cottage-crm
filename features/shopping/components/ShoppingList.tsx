"use client";

import { ShoppingItem as ShoppingItemComponent } from "./ShoppingItem";
import type { ReactNode } from "react";
import type { ShoppingFilter, ShoppingItem } from "../types/shopping";
import { useTranslations } from "next-intl";
import { EmptyState } from "@/shared/ui/EmptyState";
import { RowList } from "@/shared/ui/RowList";

interface ShoppingListProps {
  items: ShoppingItem[];
  onDelete: (item: ShoppingItem) => void;
  canManageItems: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  view: ShoppingFilter;
  leadingRow?: ReactNode;
}

export function ShoppingList({
  items,
  onDelete,
  canManageItems,
  emptyTitle,
  emptyDescription,
  view,
  leadingRow,
}: ShoppingListProps) {
  const tEmpty = useTranslations(
    view === "purchased" ? "shopping.empty.purchased" : "shopping.empty.pending",
  );

  const finalEmptyTitle = emptyTitle ?? tEmpty("title");
  const finalEmptyDescription = emptyDescription ?? tEmpty("description");

  const isEmpty = items.length === 0;

  return (
    <>
      <span className="sr-only" role="status">
        {isEmpty ? finalEmptyTitle : ""}
      </span>
      {leadingRow ? (
        <div className="border-b border-border">{leadingRow}</div>
      ) : null}
      {isEmpty ? (
        <EmptyState
          title={finalEmptyTitle}
          description={finalEmptyDescription}
        />
      ) : (
        <RowList>
          {items.map((item) => (
            <ShoppingItemComponent
              key={item.id}
              item={item}
              view={view}
              canManageItems={canManageItems}
              onDelete={onDelete}
            />
          ))}
        </RowList>
      )}
    </>
  );
}
