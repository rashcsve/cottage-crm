"use client";

import { Check } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import {
  formatShoppingShortDate,
  formatShoppingTimestamp,
} from "@/features/shopping/shared/formatShoppingDate";
import { RowListItem } from "@/shared/ui/RowList";
import { StatusLabel } from "@/shared/ui/StatusLabel";
import { ShoppingActions } from "./ShoppingActions";
import { ShoppingToggleButton } from "./ShoppingToggleButton";
import type { ShoppingFilter, ShoppingItem } from "../types/shopping";

interface ShoppingItemProps {
  item: ShoppingItem;
  view: ShoppingFilter;
  canManageItems: boolean;
  onDelete: (item: ShoppingItem) => void;
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
  const canDelete = canManageItems;
  const showReturnAction = canManageItems && item.isChecked && isPurchasedView;

  return (
    <RowListItem
      id={`shopping-item-${item.id}`}
      density="compact"
      className="group relative scroll-mt-24 sm:items-start"
    >
      <div className="shrink-0">
        <ShoppingToggleButton
          item={item}
          ariaLabel={toggleAriaLabel}
          readOnlyStateLabel={
            item.isChecked ? tItem("stateBrought") : tItem("stateMissing")
          }
          errorMessage={toggleErrorMessage}
          canManageItems={isPurchasedView ? false : canManageItems}
        />
      </div>

      <div className="grid min-h-11 min-w-0 flex-1 grid-cols-[1fr_auto] content-center items-center gap-x-2 gap-y-0.5 sm:flex sm:flex-wrap sm:items-start sm:gap-x-3">
        <h3
          className={`min-w-0 flex-1 basis-40 text-[15px] leading-5 font-semibold sm:py-2.5 sm:text-base sm:leading-6 ${
            item.isChecked ? "text-ink-muted line-through" : "text-ink-primary"
          }`}
        >
          {item.title}
        </h3>

        <div className="col-start-1 flex shrink-0 items-center gap-x-1.5 text-xs text-ink-secondary sm:min-h-11">
          {isPurchasedView ? (
            <StatusLabel tone="neutral" icon={Check}>
              {item.broughtBy
                ? tItem("broughtBy", { name: item.broughtBy })
                : tItem("stateBrought")}
            </StatusLabel>
          ) : (
            <>
              <span className="sr-only">
                {tItem("addedBy", { name: item.author })}
              </span>
              <span aria-hidden="true">{item.author}</span>
              <span aria-hidden="true">·</span>
              <time
                dateTime={item.createdAt}
                title={formatShoppingTimestamp(item.createdAt, locale)}
                className="font-mono"
              >
                {formatShoppingShortDate(item.createdAt, locale)}
              </time>
            </>
          )}
        </div>

        {showReturnAction || canDelete ? (
          <div
            className={`flex shrink-0 flex-wrap items-center gap-2 transition-opacity [@media(hover:hover)]:absolute [@media(hover:hover)]:inset-y-0 [@media(hover:hover)]:right-0 [@media(hover:hover)]:bg-surface [@media(hover:hover)]:pl-3 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 group-focus-within:opacity-100 ${
              showReturnAction
                ? "col-span-2 mt-1 sm:mt-0"
                : "col-start-2 row-span-2 row-start-1"
            }`}
          >
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
    </RowListItem>
  );
}
