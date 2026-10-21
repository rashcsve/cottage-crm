import { Check, TriangleAlert, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { StatusLabel, type StatusLabelProps } from "./StatusLabel";

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
  icon?: LucideIcon;
  className?: string;
  size?: "default" | "compact";
}

const SIZE_CLASSES: Record<NonNullable<StatusBadgeProps["size"]>, string> = {
  default: "text-xs",
  compact: "text-xs",
};

const DEFAULT_TONE_ICONS: Record<
  Exclude<StatusBadgeTone, "neutral">,
  LucideIcon
> = {
  warning: TriangleAlert,
  success: Check,
};

export function StatusBadge({
  tone,
  children,
  icon,
  className = "",
  size = "default",
}: StatusBadgeProps) {
  const labelClassName = `${SIZE_CLASSES[size]} ${className}`.trim();
  const props: StatusLabelProps =
    tone === "neutral"
      ? { tone, icon, children, className: labelClassName }
      : {
          tone,
          icon: icon ?? DEFAULT_TONE_ICONS[tone],
          children,
          className: labelClassName,
        };

  return <StatusLabel {...props} />;
}
