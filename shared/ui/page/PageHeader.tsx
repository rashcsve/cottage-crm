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
    <header className="space-y-2.5">
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-stone-900 sm:text-[1.7rem]">
            {title}
          </h1>

          {description && (
            <p className="max-w-2xl text-sm leading-5 text-stone-600">
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
