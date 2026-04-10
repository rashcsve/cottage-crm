import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: ReactNode;
  actions?: ReactNode;
}

export function PageHeader({
  title,
  description,
  children,
  actions,
}: PageHeaderProps) {
  return (
    <section className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1.5">
          <h1 className="text-3xl font-semibold tracking-tight text-stone-900">
            {title}
          </h1>

          {description && (
            <p className="max-w-2xl text-sm text-stone-500">{description}</p>
          )}
        </div>

        {actions && <div className="shrink-0">{actions}</div>}
      </div>

      {children && <div>{children}</div>}
    </section>
  );
}
