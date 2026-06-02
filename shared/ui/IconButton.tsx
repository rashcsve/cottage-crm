import type { ButtonHTMLAttributes, ReactNode } from "react";

type IconButtonSize = "default" | "compact";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: IconButtonSize;
  children: ReactNode;
}

const SIZE_CLASS: Record<IconButtonSize, string> = {
  default: "h-10 w-10 rounded-xl",
  compact: "h-8 w-8 rounded-lg",
};

const BASE_CLASS =
  "inline-flex cursor-pointer items-center justify-center border border-stone-200 bg-white text-stone-500 transition hover:border-stone-300 hover:bg-stone-50 hover:text-stone-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

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
