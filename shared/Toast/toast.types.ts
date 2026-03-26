export type ToastType = "success" | "error" | "info";

export interface ToastAction {
  label: string;
  onClick: () => void;
  dismissOnClick?: boolean;
}

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
  action?: ToastAction;
}

export interface ToastOptions {
  type?: ToastType;
  duration?: number;
  action?: ToastAction;
}
