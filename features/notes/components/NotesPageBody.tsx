"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useComposerScroll } from "@/shared/hooks/useComposerScroll";
import { Button } from "@/shared/ui/Button";
import { SectionHeader } from "@/shared/ui/SectionHeader";
import { StatusBadge } from "@/shared/ui/StatusBadge";
import { NewNoteForm } from "./forms/NewNoteForm";
import { NoteList } from "./NoteList";
import type { Note } from "../types/notes";

const NOTES_HEADING_ID = "notes-collection-title";

interface NotesPageBodyProps {
  notes: Note[];
  canManageNotes: boolean;
}

export function NotesPageBody({ notes, canManageNotes }: NotesPageBodyProps) {
  const t = useTranslations("notes");
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const composerRef = useComposerScroll(isComposerOpen);

  return (
    <div className="space-y-3.5 sm:space-y-4">
      <section className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
        <header className="space-y-4 p-3.5 sm:p-4">
          <SectionHeader
            eyebrow={t("sections.eyebrow")}
            title={t("sections.notes")}
            titleId={NOTES_HEADING_ID}
            description={t("sections.notesDescription")}
            badge={
              <StatusBadge tone="neutral" className="tabular-nums">
                {notes.length}
              </StatusBadge>
            }
          />

          {canManageNotes && !isComposerOpen ? (
            <div className="flex min-w-0 flex-col gap-2.5 sm:flex-row sm:items-center xl:justify-between">
              <div className="sm:flex-none">
                <Button
                  type="button"
                  onClick={() => setIsComposerOpen(true)}
                  className="min-h-10 w-full gap-2 sm:w-auto"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  {t("form.openComposer")}
                </Button>
              </div>
            </div>
          ) : null}
        </header>

        {canManageNotes && isComposerOpen ? (
          <div
            ref={composerRef}
            className="border-t border-stone-200 bg-stone-50 px-3 py-3.5 sm:px-4 sm:py-4"
          >
            <NewNoteForm onClose={() => setIsComposerOpen(false)} />
          </div>
        ) : null}
      </section>

      <section
        className="rounded-2xl border border-stone-200 bg-stone-50/70 p-3.5 shadow-sm sm:rounded-3xl sm:p-4"
        aria-labelledby={NOTES_HEADING_ID}
      >
        <NoteList
          notes={notes}
          canManageNotes={canManageNotes}
          emptyTitle={t("empty.noNotes")}
          emptyDescription={t("empty.noNotesDescription")}
        />
      </section>
    </div>
  );
}
