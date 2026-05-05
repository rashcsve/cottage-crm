import type { ReactNode } from "react";

interface SectionHeaderProps {
  title: string;
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

const DEFAULT_EYEBROW_CLASS =
  "text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500";
const DEFAULT_TITLE_CLASS = "text-lg font-semibold text-stone-900";
const DEFAULT_DESCRIPTION_CLASS = "max-w-2xl text-sm leading-5 text-stone-600";

export function SectionHeader({
  title,
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
      className={`flex flex-col gap-2.5 sm:flex-row sm:items-start sm:justify-between ${className}`.trim()}
    >
      <div className={contentClassName}>
        {eyebrow ? <p className={eyebrowClassName}>{eyebrow}</p> : null}

        <div className="flex flex-wrap items-center gap-2.5">
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
