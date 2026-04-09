"use client";

import { ShoppingItem as ShoppingItemComponent } from "./ShoppingItem";
import type { ShoppingItem } from "../types/shopping";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useToast } from "@/shared/Toast/useToast";
import { deleteShoppingItemAction } from "../server/actions";
import { TOAST_UNDO_WINDOW_MS } from "@/shared/Toast/constants";
import { useRouter } from "@/i18n/navigation";

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
  const { showToast, dismissToast, info, error } = useToast();

  const [displayItems, setDisplayItems] = useState<ShoppingItem[]>(items);
  const pendingDeleteTimersRef = useRef<Map<ShoppingItem["id"], number>>(
    new Map()
  );

  const finalEmptyTitle = emptyTitle || tEmpty("title");
  const finalEmptyDescription = emptyDescription || tEmpty("description");

  useEffect(() => {
    setDisplayItems(items);
  }, [items]);

  const clearPendingDeleteTimer = useCallback((itemId: ShoppingItem["id"]) => {
    const timerId = pendingDeleteTimersRef.current.get(itemId);

    if (timerId === undefined) {
      return;
    }

    clearTimeout(timerId);
    pendingDeleteTimersRef.current.delete(itemId);
  }, []);

  const restoreItem = useCallback(
    (item: ShoppingItem) => {
      setDisplayItems((prev) => {
        if (prev.some((i) => i.id === item.id)) {
          return prev;
        }

        const originalIndex = items.findIndex((i) => i.id === item.id);

        if (originalIndex < 0 || originalIndex > prev.length) {
          return [...prev, item];
        }

        const nextItems = [...prev];
        nextItems.splice(originalIndex, 0, item);

        return nextItems;
      });
    },
    [items]
  );

  const commitDelete = useCallback(
    async (item: ShoppingItem, toastId: string) => {
      try {
        const result = await deleteShoppingItemAction(item.id);

        dismissToast(toastId);

        if (!result.ok) {
          restoreItem(item);
          error(result.error || tCommon("error"));
          return;
        }

        router.refresh();
      } catch (err) {
        dismissToast(toastId);

        restoreItem(item);

        const message = err instanceof Error ? err.message : tCommon("error");

        error(message);
      } finally {
        clearPendingDeleteTimer(item.id);
      }
    },
    [dismissToast, restoreItem, error, router, tCommon, clearPendingDeleteTimer]
  );

  const handleDelete = useCallback(
    (item: ShoppingItem) => {
      if (pendingDeleteTimersRef.current.has(item.id)) {
        return;
      }

      setDisplayItems((prev) => prev.filter((i) => i.id !== item.id));

      let toastId = "";

      const handleUndo = () => {
        clearPendingDeleteTimer(item.id);
        dismissToast(toastId);
        restoreItem(item);
        info(tDelete("restored"));
      };

      toastId = showToast(tDelete("success"), {
        type: "info",
        duration: TOAST_UNDO_WINDOW_MS,
        action: { label: tDelete("undo"), onClick: handleUndo },
      });

      const timerId = window.setTimeout(() => {
        void commitDelete(item, toastId);
      }, TOAST_UNDO_WINDOW_MS);

      pendingDeleteTimersRef.current.set(item.id, timerId);
    },
    [
      commitDelete,
      dismissToast,
      info,
      restoreItem,
      showToast,
      tDelete,
      clearPendingDeleteTimer,
    ]
  );

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
