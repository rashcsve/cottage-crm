import { ReactNode } from "react";

export type StatusBadgeTone = "warning" | "success" | "neutral";

interface StatusBadgeProps {
  tone: StatusBadgeTone;
  children: ReactNode;
  className?: string;
}

const TONE_CLASSES: Record<StatusBadgeTone, string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
  neutral: "border-stone-200 bg-stone-100 text-stone-700",
};

const BASE_CLASS_NAME =
  "inline-flex rounded-full border px-2.5 py-1 text-xs font-medium";

export function StatusBadge({ tone, children, className }: StatusBadgeProps) {
  return (
    <span
      className={`${BASE_CLASS_NAME} ${TONE_CLASSES[tone]} ${className ?? ""}`}
    >
      {children}
    </span>
  );
}
