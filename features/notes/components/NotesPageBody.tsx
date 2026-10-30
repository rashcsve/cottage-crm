"use client";

import type { ReactNode } from "react";
import { CalendarDays, History } from "lucide-react";
import { useTranslations } from "next-intl";
import { filterNotes } from "@/features/notes/domain/note-filters";
import { groupNotesByRecency } from "@/features/notes/domain/note-groups";
import { deleteNoteAction } from "@/features/notes/server/actions";
import { useRouter } from "@/i18n/navigation";
import { useOptimisticRemoveList } from "@/shared/hooks/useOptimisticRemoveList";
import { EmptyState } from "@/shared/ui/EmptyState";
import { Surface } from "@/shared/ui/Surface";
import { TextLink } from "@/shared/ui/TextLink";
import { NoteGroup } from "./NoteGroup";
import { NoteList } from "./NoteList";
import { NoteQuickAddBar } from "./NoteQuickAddBar";
import { NotesFilterChips } from "./NotesFilterChips";
import { NotesHeaderSummary } from "./NotesHeaderSummary";
import type { Note, NotesShowFilter } from "../types/notes";

const NOTES_HEADING_ID = "notes-collection-title";
const THIS_WEEK_HEADING_ID = "notes-group-this-week";
const EARLIER_HEADING_ID = "notes-group-earlier";

type NotesView = "groups" | "filteredEmpty" | "empty";

interface NotesPageBodyProps {
  notes: Note[];
  canManageNotes: boolean;
  activeShow: NotesShowFilter;
  currentUserId: string;
  todayIso: string;
}

function getNotesView(filteredCount: number, totalCount: number): NotesView {
  if (filteredCount > 0) {
    return "groups";
  }

  return totalCount === 0 ? "empty" : "filteredEmpty";
}

export function NotesPageBody({
  notes,
  canManageNotes,
  activeShow,
  currentUserId,
  todayIso,
}: NotesPageBodyProps) {
  const t = useTranslations("notes");
  const tCommon = useTranslations("common");
  const router = useRouter();

  const { items: visibleNotes, removeItem: removeNote } =
    useOptimisticRemoveList({
      items: notes,
      commitRemove: (note) => deleteNoteAction({ noteId: note.id }),
      messages: {
        success: t("delete.success"),
        restored: t("delete.restored"),
        undo: t("delete.undo"),
        fallbackError: tCommon("error"),
        retry: t("delete.retry"),
      },
      onCommitSuccess: () => {
        router.refresh();
      },
    });

  const thisWeekCount = groupNotesByRecency(visibleNotes, todayIso).thisWeek
    .length;
  const filteredNotes = filterNotes(visibleNotes, activeShow, currentUserId);
  const recencyGroups = groupNotesByRecency(filteredNotes, todayIso);
  const view = getNotesView(filteredNotes.length, visibleNotes.length);

  const sharedPermissions = { canManageNotes, onDelete: removeNote };

  function renderNotes() {
    if (view === "filteredEmpty") {
      return (
        <Surface className="px-4 lg:px-6">
          <EmptyState
            title={t("empty.filteredTitle")}
            description={t("empty.filteredDescription")}
            action={
              <TextLink href={{ pathname: "/notes" }}>
                {t("empty.showAll")}
              </TextLink>
            }
          />
        </Surface>
      );
    }

    if (view === "empty") {
      return (
        <Surface className="px-4 lg:px-6">
          <NoteList
            notes={[]}
            emptyTitle={t("empty.noNotes")}
            emptyDescription={t("empty.noNotesDescription")}
            {...sharedPermissions}
          />
        </Surface>
      );
    }

    return (
      <Surface className="divide-y divide-border px-4 pb-1 lg:px-6">
        {recencyGroups.thisWeek.length > 0 ? (
          <NoteGroup
            headingId={THIS_WEEK_HEADING_ID}
            title={t("groups.thisWeek")}
            icon={CalendarDays}
            notes={recencyGroups.thisWeek}
            {...sharedPermissions}
          />
        ) : null}

        {recencyGroups.earlier.length > 0 ? (
          <NoteGroup
            headingId={EARLIER_HEADING_ID}
            title={t("groups.earlier")}
            icon={History}
            notes={recencyGroups.earlier}
            {...sharedPermissions}
          />
        ) : null}
      </Surface>
    );
  }

  function renderPage(headerTrigger: ReactNode) {
    return (
      <div className="space-y-2">
        <header className="space-y-3 px-3.5 pb-1 sm:px-4 sm:pb-4">
          <div className="flex items-center justify-between gap-3">
            <NotesHeaderSummary
              totalCount={visibleNotes.length}
              thisWeekCount={thisWeekCount}
            />
            {headerTrigger}
          </div>
          <NotesFilterChips activeShow={activeShow} />
        </header>

        <section aria-labelledby={NOTES_HEADING_ID}>
          <h2 id={NOTES_HEADING_ID} className="sr-only">
            {t("sections.notes")}
          </h2>
          {renderNotes()}
        </section>
      </div>
    );
  }

  if (canManageNotes) {
    return <NoteQuickAddBar>{renderPage}</NoteQuickAddBar>;
  }

  return renderPage(null);
}
