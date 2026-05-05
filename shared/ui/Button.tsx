import type { ButtonHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "secondary";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "bg-stone-900 text-white hover:bg-stone-800",
  secondary:
    "border border-stone-300 bg-white text-stone-700 hover:border-stone-400 hover:text-stone-900",
};

const BASE_CLASS =
  "inline-flex min-h-11 items-center justify-center rounded-xl px-4 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:ring-offset-2";

export function buttonVariants(
  variant: ButtonVariant = "primary",
  className = "",
): string {
  return `${BASE_CLASS} ${VARIANT_CLASSES[variant]} ${className}`.trim();
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={buttonVariants(
        variant,
        `disabled:cursor-not-allowed disabled:opacity-50 ${className}`,
      )}
    />
  );
}
