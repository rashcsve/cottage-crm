"use client";

import { useTranslations } from "next-intl";
import { ShoppingActions } from "./ShoppingActions";
import { ShoppingToggleButton } from "./ShoppingToggleButton";
import type { ShoppingItem } from "../types/shopping";

interface ShoppingItemProps {
  item: ShoppingItem;
  canManageItems: boolean;
  onDelete: (item: ShoppingItem) => void;
  isLast?: boolean;
}

export function ShoppingItem({
  item,
  canManageItems,
  onDelete,
  isLast = false,
}: ShoppingItemProps) {
  const t = useTranslations("shopping");

  const toggleAriaLabel = item.isChecked
    ? t("aria.unmarkAsResolved", { title: item.title })
    : t("aria.markAsResolved", { title: item.title });

  const toggleErrorMessage = t("toggle.error");

  return (
    <li className={!isLast ? "border-b border-stone-200" : ""}>
      <div className="flex gap-3 px-4 py-4 sm:px-5">
        <div className="shrink-0 pt-0.5">
          <ShoppingToggleButton
            item={item}
            ariaLabel={toggleAriaLabel}
            errorMessage={toggleErrorMessage}
            canManageItems={canManageItems}
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h3
                className={
                  item.isChecked
                    ? "text-sm font-semibold text-stone-500 line-through"
                    : "text-sm font-semibold text-stone-900"
                }
              >
                {item.title}
              </h3>

              <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-stone-500">
                <span>
                  {t("item.author")}: {item.author}
                </span>

                {item.broughtBy && (
                  <span>
                    {t("item.brought_by")}: {item.broughtBy}
                  </span>
                )}
              </div>
            </div>

            {canManageItems && (
              <div className="flex items-start self-start">
                <ShoppingActions
                  item={item}
                  canManageItems={canManageItems}
                  onDelete={onDelete}
                  deleteAriaLabel={`${t("aria.deleteItem")} ${item.title}`}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </li>
  );
}
