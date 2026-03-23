"use client";

import { createContext, useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { ToastContainer } from "@/shared/ui/Toast/ToastContainer";
import type { Toast, ToastType } from "@/lib/types/toast.types";

interface ToastContextValue {
  toasts: Toast[];
  addToast: (message: string, type?: ToastType, duration?: number) => string;
  dismissToast: (id: string) => void;
  error: (message: string, duration?: number) => string;
  success: (message: string, duration?: number) => string;
}

export const ToastContext = createContext<ToastContextValue | undefined>(
  undefined
);

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timersRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    const timers = timersRef.current;

    return () => {
      timers.forEach((timerId) => {
        window.clearTimeout(timerId);
      });
      timers.clear();
    };
  }, []);

  const dismissToast = useCallback((id: string) => {
    const timerId = timersRef.current.get(id);

    if (timerId !== undefined) {
      window.clearTimeout(timerId);
      timersRef.current.delete(id);
    }

    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    (message: string, type: ToastType = "success", duration = 3000): string => {
      const id = crypto.randomUUID();
      const toast: Toast = { id, type, message, duration };

      setToasts((prev) => [...prev, toast]);

      if (duration > 0) {
        const timerId: number = window.setTimeout(() => {
          dismissToast(id);
        }, duration);

        timersRef.current.set(id, timerId);
      }

      return id;
    },
    [dismissToast]
  );

  const error = useCallback(
    (message: string, duration?: number) =>
      addToast(message, "error", duration),
    [addToast]
  );

  const success = useCallback(
    (message: string, duration?: number) =>
      addToast(message, "success", duration),
    [addToast]
  );

  return (
    <ToastContext.Provider
      value={{
        toasts,
        addToast,
        dismissToast,
        error,
        success,
      }}
    >
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
}
