import { NewNoteForm } from "@/features/notes/components/forms/NewNoteForm";
import { NoteList } from "@/features/notes/components/NoteList";
import type { Note } from "@/features/notes/types/notes";
import { Surface } from "@/shared/ui/Surface";
import { StatusBadge } from "@/shared/ui/StatusBadge";

export interface NotesPageBodyLabels {
  eyebrow: string;
  title: string;
  description: string;
  emptyTitle: string;
  emptyDescription: string;
}

interface NotesPageBodyProps {
  notes: Note[];
  canManageNotes: boolean;
  labels: NotesPageBodyLabels;
}

export function NotesPageBody({
  notes,
  canManageNotes,
  labels,
}: NotesPageBodyProps) {
  return (
    <Surface className="overflow-hidden">
      <section
        aria-labelledby="notes-collection-title"
        className="space-y-5 px-4 py-4 sm:px-5"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">
              {labels.eyebrow}
            </p>

            <div className="flex flex-wrap items-center gap-2.5">
              <h2
                id="notes-collection-title"
                className="text-lg font-semibold text-stone-900"
              >
                {labels.title}
              </h2>

              <StatusBadge tone="neutral" className="tabular-nums">
                {notes.length}
              </StatusBadge>
            </div>

            <p className="max-w-2xl text-sm text-stone-600">
              {labels.description}
            </p>
          </div>
        </div>

        {canManageNotes ? <NewNoteForm /> : null}
      </section>

      <div className="border-t border-stone-200">
        <NoteList
          notes={notes}
          canManageNotes={canManageNotes}
          emptyTitle={labels.emptyTitle}
          emptyDescription={labels.emptyDescription}
          variant="plain"
        />
      </div>
    </Surface>
  );
}
