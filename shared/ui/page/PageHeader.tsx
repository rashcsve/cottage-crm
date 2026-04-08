import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: ReactNode;
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="space-y-2">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-stone-900">
            {title}
          </h1>

          {description && (
            <p className="max-w-2xl text-sm text-stone-500">{description}</p>
          )}
        </header>

        {children}
      </div>
    </div>
  );
}
