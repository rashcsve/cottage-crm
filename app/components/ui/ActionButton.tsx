interface ActionButtonProps {
  children: React.ReactNode;
  tone?: "default" | "danger";
  className?: string;
}

export function ActionButton({
  children,
  tone = "default",
  className = "",
}: ActionButtonProps) {
  const toneClassName =
    tone === "danger"
      ? "border-red-200 text-red-700 hover:text-red-800"
      : "border-stone-200 text-stone-700 hover:text-stone-900";

  return (
    <button
      type="submit"
      className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition cursor-pointer ${toneClassName} ${className}`}
    >
      {children}
    </button>
  );
}
