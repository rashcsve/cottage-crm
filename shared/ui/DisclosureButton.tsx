"use client";

import type { ReactNode } from "react";
import type { DisclosureState } from "@/shared/hooks/useDisclosure";

const DISCLOSURE_BUTTON_CLASS =
  "inline-flex min-h-6 cursor-pointer items-center gap-1 rounded-control text-2xs font-semibold text-ink-secondary hover:text-ink-primary sm:text-xs";

interface DisclosureButtonProps {
  disclosure: DisclosureState;
  children: ReactNode;
  ariaLabel?: string;
}

export function DisclosureButton({
  disclosure,
  children,
  ariaLabel,
}: DisclosureButtonProps) {
  return (
    <button
      type="button"
      aria-expanded={disclosure.isExpanded}
      aria-controls={disclosure.panelId}
      aria-label={ariaLabel}
      onClick={disclosure.toggle}
      className={DISCLOSURE_BUTTON_CLASS}
    >
      {children}
    </button>
  );
}
