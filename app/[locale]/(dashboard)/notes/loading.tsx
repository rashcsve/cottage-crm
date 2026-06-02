import { NoteListSkeleton } from "@/features/notes/components/NoteListSkeleton";
import { PageLayout } from "@/shared/ui/page/PageLayout";
import { getTranslations } from "next-intl/server";

export default async function NotesLoading() {
  const tNotes = await getTranslations("notes");

  return (
    <PageLayout
      title={tNotes("pageTitle")}
      description={tNotes("pageDescription")}
    >
      <div className="space-y-3.5 sm:space-y-4">
        <section className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
          <header className="space-y-4 p-3.5 sm:p-4">
            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-start sm:justify-between">
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

              <div className="h-10 w-28 animate-pulse rounded-xl bg-stone-100" />
            </div>
          </header>
        </section>

        <section className="rounded-2xl border border-stone-200 bg-stone-50/70 p-3.5 shadow-sm sm:rounded-3xl sm:p-4">
          <NoteListSkeleton />
        </section>
      </div>
    </PageLayout>
  );
}
