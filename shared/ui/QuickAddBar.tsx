"use client";

import type { ReactNode } from "react";
import { Plus } from "lucide-react";
import { useQuickAddSheet } from "@/shared/hooks/useQuickAddSheet";
import { AddItemFormPanel } from "./AddItemFormPanel";
import { Button } from "./Button";
import { QuickAddAnnouncer } from "./Form/QuickAddAnnouncer";
import { MobileActionBar } from "./MobileActionBar";

const MOBILE_TRIGGER_CLASS = "w-full min-h-12";

interface QuickAddBarLabels {
  button: string;
  sheetTitle: string;
  close: string;
}

interface QuickAddFormHandlers {
  onAdded: (title: string) => void;
  onCancel: () => void;
}

interface QuickAddBarProps {
  labels: QuickAddBarLabels;
  titleId: string;
  getAddedMessage: (title: string) => string;
  renderForm: (handlers: QuickAddFormHandlers) => ReactNode;
  skeleton?: ReactNode;
  showControls?: boolean;
  children?: (headerTrigger: ReactNode) => ReactNode;
}

export function QuickAddBar({
  labels,
  titleId,
  getAddedMessage,
  renderForm,
  skeleton,
  showControls = true,
  children,
}: QuickAddBarProps) {
  const sheet = useQuickAddSheet(getAddedMessage);

  if (!showControls && sheet.isOpen) {
    sheet.close();
  }

  function renderTrigger(className: string) {
    return (
      <Button type="button" onClick={sheet.open} className={className}>
        <Plus className="size-4 shrink-0" aria-hidden="true" />
        {labels.button}
      </Button>
    );
  }

  const announcer = <QuickAddAnnouncer announcement={sheet.announcement} />;

  const sheetControls = showControls && (
    <>
      <MobileActionBar>{renderTrigger(MOBILE_TRIGGER_CLASS)}</MobileActionBar>

      <AddItemFormPanel
        open={sheet.isOpen}
        onClose={sheet.close}
        title={labels.sheetTitle}
        titleId={titleId}
        closeLabel={labels.close}
        skeleton={skeleton}
      >
        {renderForm({ onAdded: sheet.handleAdded, onCancel: sheet.close })}
      </AddItemFormPanel>
    </>
  );

  if (!children) {
    return (
      <>
        {announcer}
        {sheetControls}
      </>
    );
  }

  return (
    <div>
      <div className="space-y-2">
        {announcer}

        {children(
          showControls ? (
            <div className="hidden shrink-0 lg:block">{renderTrigger("")}</div>
          ) : null,
        )}
      </div>

      {sheetControls}
    </div>
  );
}
