import type { ReactNode } from "react";

export const statusBadgeTone = {
  neutral: "neutral",
  warning: "warning",
  success: "success",
} as const;

export type StatusBadgeTone =
  (typeof statusBadgeTone)[keyof typeof statusBadgeTone];

interface StatusBadgeProps {
  tone: StatusBadgeTone;
  children: ReactNode;
  className?: string;
  size?: "default" | "compact";
}

const TONE_CLASSES: Record<StatusBadgeTone, string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
  neutral: "border-stone-200 bg-stone-100 text-stone-700",
};

const BASE_CLASS_NAME = "inline-flex rounded-full border font-medium";

const SIZE_CLASSES: Record<NonNullable<StatusBadgeProps["size"]>, string> = {
  default: "px-2.5 py-1 text-xs",
  compact: "px-2 py-0.5 text-[11px]",
};

export function StatusBadge({
  tone,
  children,
  className,
  size = "default",
}: StatusBadgeProps) {
  return (
    <span
      className={`${BASE_CLASS_NAME} ${SIZE_CLASSES[size]} ${TONE_CLASSES[tone]} ${className ?? ""}`}
    >
      {children}
    </span>
  );
}
