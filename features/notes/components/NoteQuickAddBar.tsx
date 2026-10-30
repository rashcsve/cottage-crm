"use client";

import type { ReactNode } from "react";
import dynamic from "next/dynamic";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useQuickAddSheet } from "@/shared/hooks/useQuickAddSheet";
import { AddItemFormPanel } from "@/shared/ui/AddItemFormPanel";
import { Button } from "@/shared/ui/Button";
import { QuickAddAnnouncer } from "@/shared/ui/Form/QuickAddAnnouncer";
import { MobileActionBar } from "@/shared/ui/MobileActionBar";
import { NewNoteFormSkeleton } from "./forms/NewNoteFormSkeleton";

const NewNoteForm = dynamic(() =>
  import("./forms/NewNoteForm").then((module) => module.NewNoteForm),
);

const ADD_NOTE_PANEL_TITLE_ID = "notes-add-note-panel-title";

interface NoteQuickAddBarProps {
  children: (headerTrigger: ReactNode) => ReactNode;
}

export function NoteQuickAddBar({ children }: NoteQuickAddBarProps) {
  const t = useTranslations("notes.form");
  const sheet = useQuickAddSheet((message) => message);

  function renderTrigger(className: string) {
    return (
      <Button type="button" onClick={sheet.open} className={className}>
        <Plus className="size-4 shrink-0" aria-hidden="true" />
        {t("openComposer")}
      </Button>
    );
  }

  return (
    <div>
      <div className="space-y-2">
        <QuickAddAnnouncer announcement={sheet.announcement} />

        {children(
          <div className="hidden shrink-0 lg:block">{renderTrigger("")}</div>,
        )}
      </div>

      <MobileActionBar>{renderTrigger("w-full min-h-12")}</MobileActionBar>

      <AddItemFormPanel
        open={sheet.isOpen}
        onClose={sheet.close}
        title={t("title")}
        titleId={ADD_NOTE_PANEL_TITLE_ID}
        closeLabel={t("closeComposer")}
        skeleton={<NewNoteFormSkeleton />}
      >
        <NewNoteForm onAdded={sheet.handleAdded} />
      </AddItemFormPanel>
    </div>
  );
}
