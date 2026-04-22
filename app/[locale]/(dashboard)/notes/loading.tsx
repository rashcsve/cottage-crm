import { NoteListSkeleton } from "@/features/notes/components/NoteListSkeleton";
import { Surface } from "@/shared/ui/Surface";
import { PageLayout } from "@/shared/ui/page/PageLayout";
import { getTranslations } from "next-intl/server";

export default async function NotesLoading() {
  const tNotes = await getTranslations("notes");

  return (
    <PageLayout
      title={tNotes("pageTitle")}
      description={tNotes("pageDescription")}
    >
      <Surface className="overflow-hidden">
        <div className="space-y-5 px-4 py-4 sm:px-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">
                {tNotes("sections.eyebrow")}
              </p>

              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-lg font-semibold text-stone-900">
                  {tNotes("sections.notes")}
                </h2>
                <div className="h-6 w-10 animate-pulse rounded-full bg-stone-100" />
              </div>

              <p className="max-w-2xl text-sm text-stone-600">
                {tNotes("sections.notesDescription")}
              </p>
            </div>

            <div className="h-9 w-28 animate-pulse rounded-xl bg-stone-100" />
          </div>
        </div>

        <div className="border-t border-stone-200">
          <NoteListSkeleton variant="plain" />
        </div>
      </Surface>
    </PageLayout>
  );
}
