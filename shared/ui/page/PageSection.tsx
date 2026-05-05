import type { ReactNode } from "react";

interface PageSectionProps {
  eyebrow?: string;
  title: string;
  description?: string;
  count?: number;
  children: ReactNode;
  variant?: "card" | "plain";
}

export function PageSection({
  eyebrow,
  title,
  description,
  count,
  children,
  variant = "card",
}: PageSectionProps) {
  const isCard = variant === "card";

  return (
    <section
      className={
        isCard
          ? "rounded-2xl border border-stone-200 bg-white p-4 shadow-sm"
          : "space-y-3"
      }
    >
      <header
        className={
          isCard
            ? "mb-4 flex flex-col gap-2.5 sm:flex-row sm:items-end sm:justify-between"
            : ""
        }
      >
        <div className="space-y-1">
          {eyebrow && (
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">
              {eyebrow}
            </p>
          )}

          <div className="flex items-center gap-2">
            <h2
              className={
                isCard
                  ? "text-lg font-semibold text-stone-900"
                  : "text-lg font-semibold text-stone-900"
              }
            >
              {title}
            </h2>
            {count !== undefined && (
              <span
                className={
                  isCard
                    ? "inline-flex items-center justify-center rounded-full bg-stone-100 px-2.5 py-1 text-sm font-semibold text-stone-700"
                    : "text-sm font-medium text-stone-600"
                }
              >
                {count}
              </span>
            )}
          </div>

          {description && (
            <p className="text-sm leading-5 text-stone-600">{description}</p>
          )}
        </div>
      </header>

      {children}
    </section>
  );
}
