"use client";

import { X, TriangleAlert, CircleCheck, Info, type LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Toast } from "@/shared/Toast/toast.types";
import { IconButton } from "@/shared/ui/IconButton";

interface ToastProps extends Toast {
  onDismiss: (id: string) => void;
}

const TOAST_VARIANTS: Record<
  Toast["type"],
  {
    Icon: LucideIcon;
    role: "alert" | "status";
    ariaLive: "assertive" | "polite";
  }
> = {
  error: {
    Icon: TriangleAlert,
    role: "alert",
    ariaLive: "assertive",
  },
  info: {
    Icon: Info,
    role: "status",
    ariaLive: "polite",
  },
  success: {
    Icon: CircleCheck,
    role: "status",
    ariaLive: "polite",
  },
};

export function Toast({ id, type, message, action, onDismiss }: ToastProps) {
  const { Icon, role, ariaLive } = TOAST_VARIANTS[type];
  const tCommon = useTranslations("common");

  function handleDismiss() {
    onDismiss(id);
  }

  function handleActionClick() {
    if (!action) return;

    action.onClick();

    if (action.dismissOnClick !== false) {
      handleDismiss();
    }
  }

  return (
    <div
      className="pointer-events-auto flex items-center gap-3 rounded-card bg-ink-primary py-1 pr-1 pl-4 text-on-accent"
      role={role}
      aria-live={ariaLive}
    >
      <Icon className="size-5 shrink-0" aria-hidden="true" />
      <p className="flex-1 py-2.5 text-sm font-medium">{message}</p>

      {action && (
        <button
          type="button"
          onClick={handleActionClick}
          className="min-h-11 shrink-0 cursor-pointer px-2 text-sm font-semibold underline underline-offset-2 focus-visible:outline-on-accent"
        >
          {action.label}
        </button>
      )}

      <IconButton
        type="button"
        onClick={handleDismiss}
        size="compact"
        className="text-on-accent hover:bg-ink-secondary hover:text-on-accent focus-visible:outline-on-accent"
        aria-label={tCommon("close")}
      >
        <X aria-hidden="true" />
      </IconButton>
    </div>
  );
}
