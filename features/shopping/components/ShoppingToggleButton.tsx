"use client";

import { useTransition } from "react";
import { CheckCircle2 } from "lucide-react";
import { toggleShoppingItemAction } from "@/features/shopping/server/actions";
import { useToast } from "@/shared/Toast/useToast";
import type { ShoppingItem } from "../types/shopping";

interface ShoppingToggleButtonProps {
  item: ShoppingItem;
  ariaLabel: string;
  errorMessage: string;
  canManageItems: boolean;
}

const BASE_TOGGLE_STYLES =
  "flex h-8 w-8 items-center justify-center rounded-xl border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:ring-offset-2";

const STATUS_STYLES = {
  purchased: "border-emerald-200 bg-emerald-50 text-emerald-700",
  pending: "border-stone-200 bg-white text-stone-500",
};

const INTERACTIVE_TOGGLE_STYLES = `${BASE_TOGGLE_STYLES} cursor-pointer hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50`;
const READ_ONLY_STATUS_STYLES = `${BASE_TOGGLE_STYLES} cursor-not-allowed border-stone-200 bg-stone-50`;

export function ShoppingToggleButton({
  item,
  ariaLabel,
  errorMessage,
  canManageItems,
}: ShoppingToggleButtonProps) {
  const [isPending, startTransition] = useTransition();
  const { error: showError } = useToast();

  const isPurchased = item.isChecked;

  if (!canManageItems) {
    return (
      <div className={READ_ONLY_STATUS_STYLES}>
        {isPurchased && <span className="text-xs text-stone-400">✓</span>}
      </div>
    );
  }

  function handleToggleClick() {
    startTransition(async () => {
      try {
        const result = await toggleShoppingItemAction(item.id, item.isChecked);

        if (!result.ok) {
          showError(result.error || errorMessage);
        }
      } catch (error) {
        showError(error instanceof Error ? error.message : errorMessage);
      }
    });
  }

  const statusKey = isPurchased ? "purchased" : "pending";
  const statusStyle = STATUS_STYLES[statusKey];

  return (
    <button
      type="button"
      onClick={handleToggleClick}
      disabled={isPending}
      aria-label={ariaLabel}
      aria-busy={isPending}
      className={`${INTERACTIVE_TOGGLE_STYLES} ${statusStyle}`}
    >
      {isPurchased && <CheckCircle2 className="h-5 w-5" aria-hidden="true" />}
    </button>
  );
}
