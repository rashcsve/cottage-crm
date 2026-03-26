"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import { ToastContainer } from "@/shared/Toast/ToastContainer";
import type { ToastOptions, Toast } from "@/shared/Toast/toast.types";
import { TOAST_DEFAULT_DURATION_MS } from "@/shared/Toast/constants";

interface ToastContextValue {
  toasts: Toast[];
  showToast: (message: string, options?: ToastOptions) => string;
  dismissToast: (id: string) => void;
  success: (message: string, options?: Omit<ToastOptions, "type">) => string;
  error: (message: string, options?: Omit<ToastOptions, "type">) => string;
  info: (message: string, options?: Omit<ToastOptions, "type">) => string;
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

  const dismissToast = useCallback((id: string) => {
    const timerId = timersRef.current.get(id);

    if (timerId !== undefined) {
      window.clearTimeout(timerId);
      timersRef.current.delete(id);
    }

    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const scheduleDismiss = useCallback(
    (id: string, duration: number) => {
      if (duration <= 0) {
        return;
      }

      const existingTimerId = timersRef.current.get(id);

      if (existingTimerId !== undefined) {
        window.clearTimeout(existingTimerId);
      }

      const timerId = window.setTimeout(() => {
        dismissToast(id);
      }, duration);

      timersRef.current.set(id, timerId);
    },
    [dismissToast]
  );

  const showToast = useCallback(
    (message: string, options: ToastOptions = {}): string => {
      const id = crypto.randomUUID();
      const toast: Toast = {
        id,
        message,
        type: options.type ?? "success",
        duration: options.duration ?? TOAST_DEFAULT_DURATION_MS,
        action: options.action,
      };

      setToasts((prev) => [...prev, toast]);
      scheduleDismiss(id, toast.duration ?? TOAST_DEFAULT_DURATION_MS);

      return id;
    },
    [scheduleDismiss]
  );

  const success = useCallback(
    (message: string, options?: Omit<ToastOptions, "type">) =>
      showToast(message, { ...options, type: "success" }),
    [showToast]
  );

  const error = useCallback(
    (message: string, options?: Omit<ToastOptions, "type">) =>
      showToast(message, { ...options, type: "error" }),
    [showToast]
  );

  const info = useCallback(
    (message: string, options?: Omit<ToastOptions, "type">) =>
      showToast(message, { ...options, type: "info" }),
    [showToast]
  );

  useEffect(() => {
    const timers = timersRef.current;

    return () => {
      timers.forEach((timerId) => {
        window.clearTimeout(timerId);
      });
      timers.clear();
    };
  }, []);

  const value = useMemo(
    () => ({
      toasts,
      showToast,
      dismissToast,
      success,
      error,
      info,
    }),
    [toasts, showToast, dismissToast, success, error, info]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
}
