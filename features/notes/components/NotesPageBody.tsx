"use client";

import { useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useComposerScroll } from "@/shared/hooks/useComposerScroll";
import { Button } from "@/shared/ui/Button";
import { SectionHeader } from "@/shared/ui/SectionHeader";
import { Surface } from "@/shared/ui/Surface";
import { NewNoteForm } from "./forms/NewNoteForm";
import { NoteList } from "./NoteList";
import type { Note } from "../types/notes";

const NOTES_HEADING_ID = "notes-collection-title";
const ADD_NOTE_BUTTON_ID = "notes-add-note-button";

interface NotesPageBodyProps {
  notes: Note[];
  canManageNotes: boolean;
}

export function NotesPageBody({ notes, canManageNotes }: NotesPageBodyProps) {
  const t = useTranslations("notes");
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const composerRef = useComposerScroll(isComposerOpen);
  const shouldRestoreFocusRef = useRef(false);

  useEffect(() => {
    if (isComposerOpen || !shouldRestoreFocusRef.current) return;
    shouldRestoreFocusRef.current = false;
    document.getElementById(ADD_NOTE_BUTTON_ID)?.focus();
  }, [isComposerOpen]);

  function closeComposer() {
    shouldRestoreFocusRef.current = true;
    setIsComposerOpen(false);
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
          canManageNotes && !isComposerOpen ? (
            <Button
              id={ADD_NOTE_BUTTON_ID}
              type="button"
              onClick={() => setIsComposerOpen(true)}
            >
              <Plus className="size-4" aria-hidden="true" />
              {t("form.openComposer")}
            </Button>
          ) : null
        }
      />

      {canManageNotes && isComposerOpen ? (
        <div ref={composerRef}>
          <NewNoteForm onClose={closeComposer} />
        </div>
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
