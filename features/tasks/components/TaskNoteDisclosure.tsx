"use client";

import { NotebookText } from "lucide-react";
import { useId, useState } from "react";

interface TaskNoteDisclosureProps {
  description: string;
  label: string;
  ariaLabel: string;
}

export function TaskNoteDisclosure({
  description,
  label,
  ariaLabel,
}: TaskNoteDisclosureProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const panelId = useId();

  return (
    <>
      <button
        type="button"
        aria-expanded={isExpanded}
        aria-controls={panelId}
        aria-label={ariaLabel}
        onClick={() => setIsExpanded((expanded) => !expanded)}
        className="inline-flex min-h-6 cursor-pointer items-center gap-1 rounded-control text-xs font-semibold text-ink-secondary hover:text-ink-primary"
      >
        <NotebookText className="h-3.5 w-3.5" aria-hidden="true" />
        {label}
      </button>
      <p
        id={panelId}
        hidden={!isExpanded}
        className="basis-full whitespace-pre-wrap wrap-break-word pb-2 text-sm text-ink-secondary"
      >
        {description}
      </p>
    </>
  );
}
