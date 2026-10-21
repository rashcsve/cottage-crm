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
      className={`py-6 ${className}`.trim()}
    >
      <TitleTag className="text-base font-semibold text-ink-primary">
        {title}
      </TitleTag>
      <p className="mt-1 text-sm text-ink-secondary">{description}</p>
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
