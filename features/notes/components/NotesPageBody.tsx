import { NewNoteForm } from "@/features/notes/components/forms/NewNoteForm";
import { NoteList } from "@/features/notes/components/NoteList";
import type { Note } from "@/features/notes/types/notes";
import { SectionHeader } from "@/shared/ui/SectionHeader";
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
        className="space-y-4 px-4 py-3.5"
      >
        <SectionHeader
          eyebrow={labels.eyebrow}
          title={labels.title}
          titleId="notes-collection-title"
          description={labels.description}
          badge={
            <StatusBadge tone="neutral" className="tabular-nums">
              {notes.length}
            </StatusBadge>
          }
        />

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
