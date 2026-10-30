import type { ReactNode } from "react";

type EmptyStateDensity = "default" | "compact";

interface EmptyStateProps {
  title: string;
  description: string;
  className?: string;
  titleTag?: "h2" | "h3" | "h4";
  action?: ReactNode;
  density?: EmptyStateDensity;
}

const DENSITY_CLASS: Record<EmptyStateDensity, string> = {
  default: "py-6",
  compact: "py-3",
};

export function EmptyState({
  title,
  description,
  className = "",
  titleTag = "h3",
  action,
  density = "default",
}: EmptyStateProps) {
  const TitleTag = titleTag;

  return (
    <div
      className={`${DENSITY_CLASS[density]} ${className}`.trim()}
    >
      <TitleTag className="text-base font-semibold text-ink-primary">
        {title}
      </TitleTag>
      <p className="mt-1 text-sm text-ink-secondary">{description}</p>
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
