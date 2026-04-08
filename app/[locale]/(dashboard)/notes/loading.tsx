import { NoteListSkeleton } from "@/features/notes/components/NoteListSkeleton";
import { PageContent } from "@/shared/ui/page/PageContent";
import { PageSection } from "@/shared/ui/page/PageSection";

export default function NotesLoading() {
  return (
    <PageContent>
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="h-6 w-32 animate-pulse rounded bg-stone-200" />
          <div className="h-10 w-64 animate-pulse rounded bg-stone-200" />
        </div>

        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            <PageSection
              variant="card"
              eyebrow="Loading..."
              title="Notes"
              description=""
              count={0}
            >
              <NoteListSkeleton />
            </PageSection>
          </div>

          <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
            <div className="h-80 w-full animate-pulse rounded-2xl bg-stone-200" />
            <div className="h-32 w-full animate-pulse rounded-2xl bg-stone-200" />
          </aside>
        </div>
      </div>
    </PageContent>
  );
}
