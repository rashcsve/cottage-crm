import { VisitListSkeleton } from "@/features/visits/components/VisitListSkeleton";
import { VisitSection } from "@/features/visits/components/VisitSection";
import { PageContent } from "@/shared/ui/page/PageContent";
import { PageHeader } from "@/shared/ui/page/PageHeader";

export default function VisitsLoading() {
  return (
    <PageContent>
      <div className="space-y-6">
        <PageHeader title="Visits" description="" />

        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            <VisitSection title="Visits" count={0}>
              <VisitListSkeleton />
            </VisitSection>
          </div>

          <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
            <div className="h-80 w-full animate-pulse rounded-2xl bg-stone-200" />
          </aside>
        </div>
      </div>
    </PageContent>
  );
}
