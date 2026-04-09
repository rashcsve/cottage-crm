import { NoteListSkeleton } from "@/features/notes/components/NoteListSkeleton";
import { PageContent } from "@/shared/ui/page/PageContent";
import { PageHeader } from "@/shared/ui/page/PageHeader";
import { PageSection } from "@/shared/ui/page/PageSection";
import { getTranslations } from "next-intl/server";

export default async function NotesLoading() {
  const [tCommon, tNotes] = await Promise.all([
    getTranslations("common"),
    getTranslations("notes"),
  ]);

  return (
    <PageContent>
      <div className="space-y-6">
        <PageHeader
          title={tNotes("pageTitle")}
          description={tNotes("pageDescription")}
        />

        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            <PageSection
              variant="card"
              eyebrow={tCommon("loading")}
              title={tNotes("sections.notes")}
              description={tNotes("sections.notesDescription")}
              count={0}
            >
              <NoteListSkeleton />
            </PageSection>
          </div>

          <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
            <div className="h-80 w-full animate-pulse rounded-2xl bg-stone-200" />
          </aside>
        </div>
      </div>
    </PageContent>
  );
}
