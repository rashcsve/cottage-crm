"use client";

import { useEffect } from "react";
import { X, AlertCircle, CheckCircle } from "lucide-react";
import type { Toast as ToastType } from "@/lib/types/toast.types";

interface ToastProps extends ToastType {
  onDismiss: (id: string) => void;
}

export function Toast({
  id,
  type,
  message,
  duration = 5000,
  onDismiss,
}: ToastProps) {
  useEffect(() => {
    if (duration === 0) return;
    const timer = setTimeout(() => onDismiss(id), duration);
    return () => clearTimeout(timer);
  }, [id, duration, onDismiss]);

  const isError = type === "error";
  const Icon = isError ? AlertCircle : CheckCircle;

  return (
    <div
      className={`flex items-center gap-3 rounded-xl px-4 py-3 shadow-lg ${
        isError ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"
      }`}
      role="status"
      aria-live="polite"
    >
      <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button
        type="button"
        onClick={() => onDismiss(id)}
        className="ml-2 shrink-0 text-current opacity-50 transition hover:opacity-100"
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}
