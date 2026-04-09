import { ReactNode } from "react";

interface VisitSectionProps {
  title: string;
  description?: string;
  count: number;
  children: ReactNode;
}

export function VisitSection({
  title,
  description,
  count,
  children,
}: VisitSectionProps) {
  return (
    <section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
      <header className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-stone-900">
              {title}
            </h2>
            <span className="inline-flex items-center justify-center rounded-full bg-stone-100 px-2.5 py-1 text-sm font-semibold text-stone-700">
              {count}
            </span>
          </div>

          {description && (
            <p className="text-sm text-stone-600">{description}</p>
          )}
        </div>
      </header>

      {children}
    </section>
  );
}