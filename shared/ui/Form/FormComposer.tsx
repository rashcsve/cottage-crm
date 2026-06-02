import type { ReactNode } from "react";
import { X } from "lucide-react";

import { SectionHeader } from "@/shared/ui/SectionHeader";

interface FormComposerProps {
  id: string;
  titleId: string;
  title: string;
  closeLabel: string;
  closeAriaControls?: string;
  closeAriaExpanded?: boolean;
  onClose: () => void;
  children: ReactNode;
  description?: string;
  eyebrow?: string;
  headerContent?: ReactNode;
  isBusy?: boolean;
}

interface FormSubmitBarProps {
  hint: string;
  children: ReactNode;
  className?: string;
}

const CLOSE_BUTTON_CLASS =
  "inline-flex items-center gap-2 self-start rounded-xl px-2 py-1 text-sm font-medium text-stone-600 transition hover:bg-stone-100 hover:text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

export function FormComposer({
  id,
  titleId,
  title,
  closeLabel,
  closeAriaControls,
  closeAriaExpanded,
  onClose,
  children,
  description,
  eyebrow,
  headerContent,
  isBusy = false,
}: FormComposerProps) {
  return (
    <section
      id={id}
      aria-labelledby={titleId}
      aria-busy={isBusy}
      className="rounded-3xl border border-stone-200 bg-white p-4 shadow-sm"
    >
      <div className="space-y-4">
        <SectionHeader
          eyebrow={eyebrow}
          title={title}
          titleId={titleId}
          titleTag="h2"
          titleClassName="text-base font-semibold text-stone-900"
          description={description}
          actions={
            <button
              type="button"
              onClick={onClose}
              disabled={isBusy}
              aria-controls={closeAriaControls}
              aria-expanded={closeAriaExpanded}
              className={CLOSE_BUTTON_CLASS}
            >
              <X className="h-4 w-4" aria-hidden="true" />
              <span>{closeLabel}</span>
            </button>
          }
        />

        {headerContent}
        {children}
      </div>
    </section>
  );
}

export function FormSubmitBar({
  hint,
  children,
  className = "",
}: FormSubmitBarProps) {
  return (
    <div
      className={`flex flex-col gap-3 border-t border-stone-200 pt-3 sm:flex-row sm:items-center sm:justify-between ${className}`.trim()}
    >
      <p className="text-xs leading-5 text-stone-500">{hint}</p>
      {children}
    </div>
  );
}
