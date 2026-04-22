"use client";

import { X, AlertCircle, CheckCircle, LucideIcon, Info } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Toast } from "@/shared/Toast/toast.types";

interface ToastProps extends Toast {
  onDismiss: (id: string) => void;
}

const TOAST_VARIANTS: Record<
  Toast["type"],
  {
    Icon: LucideIcon;
    className: string;
    role: "alert" | "status";
    ariaLive: "assertive" | "polite";
  }
> = {
  error: {
    Icon: AlertCircle,
    className: "border-red-200 bg-red-50 text-red-700",
    role: "alert",
    ariaLive: "assertive",
  },
  info: {
    Icon: Info,
    className: "border-blue-200 bg-blue-50 text-blue-700",
    role: "status",
    ariaLive: "polite",
  },
  success: {
    Icon: CheckCircle,
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    role: "status",
    ariaLive: "polite",
  },
};

export function Toast({ id, type, message, action, onDismiss }: ToastProps) {
  const { Icon, className, role, ariaLive } = TOAST_VARIANTS[type];
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
      className={`pointer-events-auto flex items-center gap-3 rounded-xl px-4 py-3 shadow-lg ${className}`}
      role={role}
      aria-live={ariaLive}
    >
      <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
      <p className="flex-1 text-sm font-medium">{message}</p>

      {action && (
        <button
          type="button"
          onClick={handleActionClick}
          className="ml-2 shrink-0 cursor-pointer text-sm font-semibold underline opacity-90 transition hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current focus-visible:ring-offset-2"
        >
          {action.label}
        </button>
      )}

      <button
        type="button"
        onClick={handleDismiss}
        className="ml-2 shrink-0 text-current opacity-50 transition hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current focus-visible:ring-offset-2"
        aria-label={tCommon("close")}
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}
