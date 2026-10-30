"use client";

import { useTransition } from "react";
import { Loader2, Undo2 } from "lucide-react";
import { toggleShoppingItemAction } from "@/features/shopping/server/actions";
import { useToast } from "@/shared/Toast/useToast";
import { CheckToggle } from "@/shared/ui/CheckToggle";
import { IconButton } from "@/shared/ui/IconButton";
import { useRouter } from "@/i18n/navigation";
import type { ShoppingItem } from "../types/shopping";

interface ShoppingToggleButtonBaseProps {
  item: ShoppingItem;
  ariaLabel: string;
  errorMessage: string;
  canManageItems: boolean;
}

type ShoppingToggleButtonProps = ShoppingToggleButtonBaseProps &
  (
    | { variant?: "icon"; readOnlyStateLabel: string }
    | { variant: "action" }
  );

export function ShoppingToggleButton(props: ShoppingToggleButtonProps) {
  const { item, ariaLabel, errorMessage, canManageItems } = props;
  const [isPending, startTransition] = useTransition();
  const { error: showError } = useToast();
  const router = useRouter();

  const isPurchased = item.isChecked;

  if (!canManageItems && props.variant === "action") {
    return null;
  }

  function handleToggleClick() {
    startTransition(async () => {
      try {
        const result = await toggleShoppingItemAction({
          itemId: item.id,
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

  if (props.variant === "action") {
    return (
      <IconButton
        type="button"
        onClick={handleToggleClick}
        disabled={isPending}
        aria-label={ariaLabel}
        aria-busy={isPending}
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 motion-safe:animate-spin" aria-hidden="true" />
        ) : (
          <Undo2 className="h-4 w-4" aria-hidden="true" />
        )}
      </IconButton>
    );
  }

  return (
    <CheckToggle
      checked={isPurchased}
      label={ariaLabel}
      pending={isPending}
      readOnly={!canManageItems}
      readOnlyStateLabel={props.readOnlyStateLabel}
      size="large"
      onToggle={handleToggleClick}
    />
  );
}
