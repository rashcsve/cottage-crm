import type { LucideIcon } from "lucide-react";
import { NoteList } from "@/features/notes/components/NoteList";
import type { Note } from "@/features/notes/types/notes";
import { StatusLabel } from "@/shared/ui/StatusLabel";

interface NoteGroupProps {
  title: string;
  headingId: string;
  icon: LucideIcon;
  notes: Note[];
  onDelete: (note: Note) => void;
  canManageNotes: boolean;
}

const TITLE_CLASS = "text-base font-bold tracking-heading";
const COUNT_CLASS =
  "font-mono text-sm tabular-nums text-ink-secondary before:mr-2 before:text-ink-muted before:content-['·']";

export function NoteGroup({
  title,
  headingId,
  icon,
  notes,
  onDelete,
  canManageNotes,
}: NoteGroupProps) {
  return (
    <section className="space-y-1 pt-4" aria-labelledby={headingId}>
      <div className="flex items-center gap-2">
        <h3 id={headingId}>
          <StatusLabel tone="neutral" icon={icon} className={TITLE_CLASS}>
            {title}
          </StatusLabel>
        </h3>
        <span className={COUNT_CLASS}>{notes.length}</span>
      </div>

      <NoteList
        notes={notes}
        onDelete={onDelete}
        canManageNotes={canManageNotes}
      />
    </section>
  );
}
