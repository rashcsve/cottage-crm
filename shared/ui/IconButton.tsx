import type { ButtonHTMLAttributes, ReactNode } from "react";

type IconButtonSize = "default" | "compact";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  "aria-label": string;
  size?: IconButtonSize;
  children: ReactNode;
}

const SIZE_CLASS: Record<IconButtonSize, string> = {
  default: "[&_svg]:size-5",
  compact: "[&_svg]:size-4.5",
};

const BASE_CLASS =
  "inline-flex size-11 shrink-0 items-center justify-center rounded-control bg-transparent text-ink-secondary transition-colors hover:bg-muted hover:text-ink-primary disabled:cursor-not-allowed disabled:opacity-50";

export function IconButton({
  size = "default",
  className = "",
  ...props
}: IconButtonProps) {
  return (
    <button
      {...props}
      className={`${BASE_CLASS} ${SIZE_CLASS[size]} ${className}`.trim()}
    />
  );
}
