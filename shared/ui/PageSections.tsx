import type { ReactNode } from "react";

interface PageSectionProps {
  title?: string;
  children: ReactNode;
}

export function PageSection({ title, children }: PageSectionProps) {
  return (
    <section className="space-y-3">
      {title && (
        <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">
          {title}
        </h3>
      )}

      {children}
    </section>
  );
}
