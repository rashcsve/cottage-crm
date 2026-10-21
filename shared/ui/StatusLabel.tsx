import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export const statusLabelTone = {
  neutral: "neutral",
  warning: "warning",
  success: "success",
  danger: "danger",
} as const;

export type StatusLabelTone =
  (typeof statusLabelTone)[keyof typeof statusLabelTone];

export type StatusLabelProps =
  | {
      tone: "danger" | "warning" | "success";
      icon: LucideIcon;
      children: ReactNode;
      className?: string;
    }
  | {
      tone: "neutral";
      icon?: LucideIcon;
      children: ReactNode;
      className?: string;
    };

function getToneClass(tone: StatusLabelTone): string {
  switch (tone) {
    case "danger":
      return "text-danger";
    case "warning":
      return "text-warning";
    case "success":
      return "text-success";
    case "neutral":
      return "text-ink-secondary";
    default: {
      const exhaustive: never = tone;
      return exhaustive;
    }
  }
}

export function StatusLabel({
  tone,
  icon: Icon,
  children,
  className = "",
}: StatusLabelProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold ${getToneClass(tone)} ${className}`.trim()}
    >
      {Icon ? (
        <Icon aria-hidden="true" className="size-3.5 shrink-0" />
      ) : null}
      <span>{children}</span>
    </span>
  );
}
