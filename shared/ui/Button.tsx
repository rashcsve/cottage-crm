import type { ButtonHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "secondary";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "bg-accent text-on-accent hover:bg-accent-hover",
  secondary:
    "border-control border-ink-primary bg-transparent text-ink-primary hover:bg-muted",
};

const BASE_CLASS =
  "inline-flex min-h-11 items-center gap-2 rounded-control px-4 text-sm font-semibold transition-colors";

const BLOCK_CLASS = "w-full min-h-12 justify-between";

export function buttonVariants(
  variant: ButtonVariant = "primary",
  className = "",
): string {
  return `${BASE_CLASS} justify-center ${VARIANT_CLASSES[variant]} ${className}`.trim();
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  block?: boolean;
}

export function Button({
  variant = "primary",
  block = false,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={`${BASE_CLASS} ${block ? BLOCK_CLASS : "justify-center"} ${VARIANT_CLASSES[variant]} disabled:cursor-not-allowed disabled:opacity-50 ${className}`.trim()}
    />
  );
}
