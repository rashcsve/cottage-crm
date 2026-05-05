"use client";

import { useLocale, useTranslations } from "next-intl";
import { formatShoppingTimestamp } from "@/features/shopping/shared/formatShoppingDate";
import { ShoppingActions } from "./ShoppingActions";
import { ShoppingToggleButton } from "./ShoppingToggleButton";
import type { ShoppingFilter, ShoppingItem } from "../types/shopping";

interface ShoppingItemProps {
  item: ShoppingItem;
  view: ShoppingFilter;
  canManageItems: boolean;
  onDelete: (item: ShoppingItem) => void;
}

function getShoppingTitleClassName(isPurchased: boolean): string {
  return isPurchased
    ? "text-stone-500 line-through decoration-stone-300"
    : "text-stone-900";
}

export function ShoppingItem({
  item,
  view,
  canManageItems,
  onDelete,
}: ShoppingItemProps) {
  const locale = useLocale();
  const tAria = useTranslations("shopping.aria");
  const tItem = useTranslations("shopping.item");
  const tToggle = useTranslations("shopping.toggle");

  const isPurchasedView = view === "purchased";
  const toggleAriaLabel = item.isChecked
    ? tAria("unmarkAsResolved", { title: item.title })
    : tAria("markAsResolved", { title: item.title });
  const toggleErrorMessage = tToggle("error");
  const returnToListAriaLabel = tAria("returnItemToList", { title: item.title });
  const createdAtLabel = formatShoppingTimestamp(item.createdAt, locale);
  const addedByLabel = tItem("addedBy", { name: item.author });
  const broughtByLabel = item.broughtBy
    ? tItem("broughtBy", { name: item.broughtBy })
    : null;
  const canDelete = canManageItems;
  const showReturnAction = canManageItems && item.isChecked && isPurchasedView;

  return (
    <li id={`shopping-item-${item.id}`} className="group scroll-mt-24">
      <article className="rounded-2xl border border-stone-200 bg-white p-3.5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="shrink-0 pt-0.5">
            <ShoppingToggleButton
              item={item}
              ariaLabel={toggleAriaLabel}
              errorMessage={toggleErrorMessage}
              canManageItems={isPurchasedView ? false : canManageItems}
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <h3
                  className={`text-sm font-semibold leading-6 ${getShoppingTitleClassName(item.isChecked)}`}
                >
                  {item.title}
                </h3>

                <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1">
                  <span className="text-[11px] font-medium text-stone-500">
                    {addedByLabel}
                  </span>

                  {broughtByLabel ? (
                    <span className="text-[11px] font-medium text-stone-500">
                      {broughtByLabel}
                    </span>
                  ) : null}

                  <time
                    dateTime={item.createdAt}
                    className="text-[11px] text-stone-400"
                  >
                    {createdAtLabel}
                  </time>
                </div>
              </div>

              {showReturnAction || canDelete ? (
                <div className="ml-auto flex shrink-0 flex-wrap items-center justify-end gap-2 self-start">
                  {showReturnAction ? (
                    <ShoppingToggleButton
                      item={item}
                      ariaLabel={returnToListAriaLabel}
                      errorMessage={toggleErrorMessage}
                      canManageItems={canManageItems}
                      variant="action"
                      label={tItem("returnToList")}
                    />
                  ) : null}

                  <ShoppingActions
                    item={item}
                    canDelete={canDelete}
                    onDelete={onDelete}
                    deleteAriaLabel={tAria("deleteItem", {
                      title: item.title,
                    })}
                  />
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </article>
    </li>
  );
}
