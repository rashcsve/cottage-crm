import type { ReactNode } from "react";

interface SectionHeaderProps {
  title: string;
  align?: "end" | "center";
  badge?: ReactNode;
  actions?: ReactNode;
  description?: ReactNode;
  eyebrow?: string;
  className?: string;
  contentClassName?: string;
  descriptionClassName?: string;
  eyebrowClassName?: string;
  titleClassName?: string;
  titleId?: string;
  titleTag?: "h2" | "h3" | "h4";
}

const DEFAULT_EYEBROW_CLASS = "text-xs font-semibold text-ink-muted";
const DEFAULT_TITLE_CLASS =
  "text-xl font-bold tracking-heading text-ink-primary";
const DEFAULT_DESCRIPTION_CLASS = "max-w-2xl text-sm text-ink-secondary";
const ALIGN_CLASS = {
  end: "items-end",
  center: "items-center",
} as const;

export function SectionHeader({
  title,
  align = "end",
  badge,
  actions,
  description,
  eyebrow,
  className = "",
  contentClassName = "space-y-1",
  descriptionClassName = DEFAULT_DESCRIPTION_CLASS,
  eyebrowClassName = DEFAULT_EYEBROW_CLASS,
  titleClassName = DEFAULT_TITLE_CLASS,
  titleId,
  titleTag = "h2",
}: SectionHeaderProps) {
  const TitleTag = titleTag;

  return (
    <div
      className={`flex flex-wrap ${ALIGN_CLASS[align]} justify-between gap-x-4 gap-y-2 ${className}`.trim()}
    >
      <div className={`min-w-0 ${contentClassName}`.trim()}>
        {eyebrow ? <p className={eyebrowClassName}>{eyebrow}</p> : null}

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <TitleTag id={titleId} className={titleClassName}>
            {title}
          </TitleTag>
          {badge}
        </div>

        {description ? (
          <p className={descriptionClassName}>{description}</p>
        ) : null}
      </div>

      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
  );
}
