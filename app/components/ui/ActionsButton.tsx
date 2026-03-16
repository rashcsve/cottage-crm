"use client";

interface ActionButtonProps {
  children: React.ReactNode;
  variant?: "default" | "danger";
}

export function ActionButton({
  children,
  variant = "default",
}: ActionButtonProps) {
  const className =
    variant === "danger"
      ? "text-sm font-medium text-red-700 transition cursor-pointer hover:text-red-800"
      : "text-sm font-medium text-stone-700 transition cursor-pointer hover:text-stone-900";

  return (
    <button type="submit" className={className}>
      {children}
    </button>
  );
}
