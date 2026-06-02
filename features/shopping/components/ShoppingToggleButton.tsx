"use client";

import { useTransition } from "react";
import { Check, Loader2, Undo2 } from "lucide-react";
import { toggleShoppingItemAction } from "@/features/shopping/server/actions";
import { useToast } from "@/shared/Toast/useToast";
import { useRouter } from "@/i18n/navigation";
import type { ShoppingItem } from "../types/shopping";

interface ShoppingToggleButtonProps {
  item: ShoppingItem;
  ariaLabel: string;
  errorMessage: string;
  canManageItems: boolean;
  variant?: "icon" | "action";
  label?: string;
}

const BASE_TOGGLE_STYLES =
  "inline-flex h-10 w-10 items-center justify-center rounded-xl border shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:ring-offset-2";

const STATUS_STYLES = {
  purchased: "border-emerald-200 bg-emerald-50 text-emerald-700",
  pending:
    "border-stone-300 bg-white text-stone-500 hover:border-stone-400 hover:bg-stone-50 hover:text-stone-700",
};

const INTERACTIVE_TOGGLE_STYLES = `${BASE_TOGGLE_STYLES} cursor-pointer disabled:cursor-not-allowed disabled:opacity-50`;
const READ_ONLY_STATUS_STYLES = `${BASE_TOGGLE_STYLES} border-stone-200 bg-stone-50 text-stone-400`;
const ACTION_BUTTON_STYLES =
  "inline-flex h-10 items-center gap-2 rounded-xl border border-stone-200 bg-white px-3.5 text-sm font-medium text-stone-700 shadow-sm transition hover:border-stone-300 hover:bg-stone-50 hover:text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

export function ShoppingToggleButton({
  item,
  ariaLabel,
  errorMessage,
  canManageItems,
  variant = "icon",
  label,
}: ShoppingToggleButtonProps) {
  const [isPending, startTransition] = useTransition();
  const { error: showError } = useToast();
  const router = useRouter();

  const isPurchased = item.isChecked;

  if (!canManageItems) {
    if (variant === "action") {
      return null;
    }

    return (
      <div className={READ_ONLY_STATUS_STYLES} aria-hidden="true">
        {isPurchased ? <Check className="h-4 w-4" aria-hidden="true" /> : null}
      </div>
    );
  }

  function handleToggleClick() {
    startTransition(async () => {
      try {
        const result = await toggleShoppingItemAction({
          itemId: item.id,
          isChecked: item.isChecked,
        });

        if (!result.ok) {
          showError(result.error || errorMessage);
          return;
        }

        router.refresh();
      } catch (error) {
        showError(error instanceof Error ? error.message : errorMessage);
      }
    });
  }

  const statusKey = isPurchased ? "purchased" : "pending";
  const statusStyle = STATUS_STYLES[statusKey];

  if (variant === "action") {
    return (
      <button
        type="button"
        onClick={handleToggleClick}
        disabled={isPending}
        aria-label={ariaLabel}
        aria-busy={isPending}
        className={ACTION_BUTTON_STYLES}
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <Undo2 className="h-4 w-4" aria-hidden="true" />
        )}
        <span>{label ?? ariaLabel}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleToggleClick}
      disabled={isPending}
      aria-label={ariaLabel}
      aria-busy={isPending}
      aria-pressed={isPurchased}
      className={`${INTERACTIVE_TOGGLE_STYLES} ${statusStyle}`}
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : isPurchased ? (
        <Check className="h-4 w-4" aria-hidden="true" />
      ) : null}
    </button>
  );
}
