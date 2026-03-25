import { InlineActions } from "@/shared/ui/InlineActions";
import { ListRow } from "@/shared/ui/ListRow";
import { MetaText } from "@/shared/ui/MetaText";
import { NoteActions } from "@/app/components/notes/NoteActions";
import { Note } from "@/app/components/notes/types";

interface NoteItemProps {
  note: Note;
  canManageNotes: boolean;
}

export function NoteItem({ note, canManageNotes }: NoteItemProps) {
  return (
    <ListRow>
      <div className="space-y-2">
        <p className="whitespace-pre-wrap text-stone-800 text-base">
          {note.content}
        </p>

        <MetaText>
          {note.author} •{" "}
          {new Date(note.created_at).toLocaleDateString("cs-CZ")}
        </MetaText>

        {canManageNotes && (
          <InlineActions>
            <NoteActions noteId={note.id} />
          </InlineActions>
        )}
      </div>
    </ListRow>
  );
}
