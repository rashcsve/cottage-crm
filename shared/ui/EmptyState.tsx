import type { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description: string;
  className?: string;
  titleTag?: "h2" | "h3" | "h4";
  action?: ReactNode;
}

export function EmptyState({
  title,
  description,
  className = "",
  titleTag = "h3",
  action,
}: EmptyStateProps) {
  const TitleTag = titleTag;

  return (
    <div
      className={`rounded-2xl border border-dashed border-border bg-page px-4 py-6 text-center ${className}`.trim()}
    >
      <TitleTag className="text-sm font-semibold text-ink">
        {title}
      </TitleTag>
      <p className="mt-1 text-sm text-ink-secondary">{description}</p>
      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  );
}
