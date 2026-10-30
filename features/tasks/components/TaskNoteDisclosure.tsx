"use client";

import { NotebookText } from "lucide-react";
import type { DisclosureState } from "@/shared/hooks/useDisclosure";
import { DisclosureButton } from "@/shared/ui/DisclosureButton";

interface TaskNoteButtonProps {
  disclosure: DisclosureState;
  label: string;
  ariaLabel: string;
}

export function TaskNoteButton({
  disclosure,
  label,
  ariaLabel,
}: TaskNoteButtonProps) {
  return (
    <DisclosureButton disclosure={disclosure} ariaLabel={ariaLabel}>
      <NotebookText className="h-3.5 w-3.5" aria-hidden="true" />
      {label}
    </DisclosureButton>
  );
}

interface TaskNotePanelProps {
  disclosure: DisclosureState;
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
