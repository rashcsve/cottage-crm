"use client";

import { NotebookText } from "lucide-react";
import { useId, useState } from "react";

export interface TaskNoteDisclosureState {
  isExpanded: boolean;
  panelId: string;
  toggle: () => void;
}

export function useTaskNoteDisclosure(): TaskNoteDisclosureState {
  const [isExpanded, setIsExpanded] = useState(false);
  const panelId = useId();

  return {
    isExpanded,
    panelId,
    toggle: () => setIsExpanded((expanded) => !expanded),
  };
}

interface TaskNoteButtonProps {
  disclosure: TaskNoteDisclosureState;
  label: string;
  ariaLabel: string;
}

export function TaskNoteButton({
  disclosure,
  label,
  ariaLabel,
}: TaskNoteButtonProps) {
  return (
    <button
      type="button"
      aria-expanded={disclosure.isExpanded}
      aria-controls={disclosure.panelId}
      aria-label={ariaLabel}
      onClick={disclosure.toggle}
      className="inline-flex min-h-6 cursor-pointer items-center gap-1 rounded-control text-2xs font-semibold sm:text-xs text-ink-secondary hover:text-ink-primary"
    >
      <NotebookText className="h-3.5 w-3.5" aria-hidden="true" />
      {label}
    </button>
  );
}

interface TaskNotePanelProps {
  disclosure: TaskNoteDisclosureState;
  description: string;
  className?: string;
}

export function TaskNotePanel({
  disclosure,
  description,
  className = "",
}: TaskNotePanelProps) {
  return (
    <p
      id={disclosure.panelId}
      hidden={!disclosure.isExpanded}
      className={`rounded-control bg-muted px-3 py-2 whitespace-pre-wrap wrap-break-word text-sm text-ink-secondary ${className}`.trim()}
    >
      {description}
    </p>
  );
}
