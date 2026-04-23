interface DashboardEmptyStateProps {
  title: string;
  description: string;
  compact?: boolean;
}

export function DashboardEmptyState({
  title,
  description,
  compact = false,
}: DashboardEmptyStateProps) {
  return (
    <div
      className={
        compact
          ? "rounded-xl border border-dashed border-stone-200/80 bg-stone-50/70 px-3 py-4 text-center"
          : "rounded-2xl border border-dashed border-stone-200/80 bg-stone-50/70 px-4 py-6 text-center"
      }
    >
      <p className="text-sm font-semibold text-stone-900">{title}</p>
      <p
        className={
          compact
            ? "mt-1 text-xs leading-5 text-stone-600"
            : "mt-1 text-sm leading-6 text-stone-600"
        }
      >
        {description}
      </p>
    </div>
  );
}
