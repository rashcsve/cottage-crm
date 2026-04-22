"use client";

import { Toast } from "./Toast";
import type { Toast as ToastType } from "@/shared/Toast/toast.types";

interface ToastContainerProps {
  toasts: ToastType[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div className="pointer-events-none fixed inset-x-4 bottom-[calc(var(--safe-area-bottom)+6.5rem)] z-50 space-y-2 sm:inset-x-auto sm:right-4 sm:bottom-4 sm:w-full sm:max-w-sm">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
