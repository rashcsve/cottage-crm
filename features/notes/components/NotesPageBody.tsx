"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { AddItemPanel } from "@/shared/ui/AddItemPanel";
import { Button } from "@/shared/ui/Button";
import { FormLoadBoundary } from "@/shared/ui/Form/FormLoadBoundary";
import { SectionHeader } from "@/shared/ui/SectionHeader";
import { Surface } from "@/shared/ui/Surface";
import { NoteList } from "./NoteList";
import type { Note } from "../types/notes";

const NewNoteForm = dynamic(() =>
  import("./forms/NewNoteForm").then((module) => module.NewNoteForm),
);

const NOTES_HEADING_ID = "notes-collection-title";
const ADD_NOTE_BUTTON_ID = "notes-add-note-button";
const ADD_NOTE_PANEL_TITLE_ID = "notes-add-note-panel-title";

interface NotesPageBodyProps {
  notes: Note[];
  canManageNotes: boolean;
}

export function NotesPageBody({ notes, canManageNotes }: NotesPageBodyProps) {
  const t = useTranslations("notes");
  const tCommon = useTranslations("common");
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isFormDirty, setIsFormDirty] = useState(false);

  function closePanel() {
    setIsPanelOpen(false);
    setIsFormDirty(false);
  }

  return (
    <div className="space-y-4">
      <SectionHeader
        title={t("sections.notes")}
        titleId={NOTES_HEADING_ID}
        align="center"
        className="border-b border-border pb-3"
        badge={
          <span className="font-mono text-sm tabular-nums text-ink-secondary">
            {notes.length}
          </span>
        }
        actions={
          canManageNotes ? (
            <Button
              id={ADD_NOTE_BUTTON_ID}
              type="button"
              onClick={() => setIsPanelOpen(true)}
            >
              <Plus className="size-4" aria-hidden="true" />
              {t("form.openComposer")}
            </Button>
          ) : null
        }
      />

      {canManageNotes ? (
        <AddItemPanel
          open={isPanelOpen}
          onClose={closePanel}
          title={t("form.title")}
          titleId={ADD_NOTE_PANEL_TITLE_ID}
          closeLabel={t("form.closeComposer")}
          isDirty={isFormDirty}
          discard={{
            message: t("form.discardMessage"),
            confirmLabel: tCommon("addPanel.discardConfirm"),
            cancelLabel: tCommon("addPanel.discardCancel"),
          }}
        >
          {isPanelOpen ? (
            <FormLoadBoundary
              message={tCommon("formLoadError")}
              reloadLabel={tCommon("reloadPage")}
              loadingLabel={tCommon("loading")}
            >
              <NewNoteForm onClose={closePanel} onDirtyChange={setIsFormDirty} />
            </FormLoadBoundary>
          ) : null}
        </AddItemPanel>
      ) : null}

      <section aria-labelledby={NOTES_HEADING_ID}>
        <Surface className="px-4 lg:px-6">
          <NoteList
            notes={notes}
            canManageNotes={canManageNotes}
            emptyTitle={t("empty.noNotes")}
            emptyDescription={t("empty.noNotesDescription")}
          />
        </Surface>
      </section>
    </div>
  );
}
