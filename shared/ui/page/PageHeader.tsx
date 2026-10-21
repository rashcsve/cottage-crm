import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  descriptionClassName?: string;
  children?: ReactNode;
  actions?: ReactNode;
}

export function PageHeader({
  title,
  description,
  descriptionClassName = "",
  children,
  actions,
}: PageHeaderProps) {
  return (
    <header className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <div className="min-w-0 space-y-3">
          <h1 className="text-display font-bold tracking-display text-ink-primary [--text-display:2.5rem] lg:[--text-display:3.5rem]">
            {title}
          </h1>

          {description && (
            <p
              className={`max-w-160 text-base text-ink-secondary lg:text-lg ${descriptionClassName}`.trim()}
            >
              {description}
            </p>
          )}
        </div>

        {actions && <div className="shrink-0">{actions}</div>}
      </div>

      {children && <div>{children}</div>}
    </header>
  );
}
