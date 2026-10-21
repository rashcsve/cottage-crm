import type { ReactNode } from "react";
import { X } from "lucide-react";

import { Button } from "@/shared/ui/Button";
import { SectionHeader } from "@/shared/ui/SectionHeader";
import { Surface } from "@/shared/ui/Surface";

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
    <Surface
      as="section"
      padding="default"
      id={id}
      aria-labelledby={titleId}
      aria-busy={isBusy}
    >
      <div className="space-y-4">
        <SectionHeader
          eyebrow={eyebrow}
          title={title}
          titleId={titleId}
          titleTag="h2"
          titleClassName="text-xl font-semibold text-ink-primary"
          description={description}
          actions={
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isBusy}
              aria-controls={closeAriaControls}
              aria-expanded={closeAriaExpanded}
              className="self-start"
            >
              <X className="h-4 w-4" aria-hidden="true" />
              <span>{closeLabel}</span>
            </Button>
          }
        />

        {headerContent}
        {children}
      </div>
    </Surface>
  );
}

export function FormSubmitBar({
  hint,
  children,
  className = "",
}: FormSubmitBarProps) {
  return (
    <div
      className={`flex flex-col gap-3 border-t border-border pt-3 sm:flex-row sm:items-center sm:justify-between ${className}`.trim()}
    >
      <p className="text-xs leading-5 text-ink-muted">{hint}</p>
      {children}
    </div>
  );
}
