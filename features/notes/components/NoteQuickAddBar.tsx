"use client";

import type { ReactNode } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { QuickAddBar } from "@/shared/ui/QuickAddBar";
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

  return (
    <QuickAddBar
      labels={{
        button: t("openComposer"),
        sheetTitle: t("title"),
        close: t("closeComposer"),
      }}
      titleId={ADD_NOTE_PANEL_TITLE_ID}
      getAddedMessage={(message) => message}
      renderForm={({ onAdded }) => <NewNoteForm onAdded={onAdded} />}
      skeleton={<NewNoteFormSkeleton />}
    >
      {children}
    </QuickAddBar>
  );
}
