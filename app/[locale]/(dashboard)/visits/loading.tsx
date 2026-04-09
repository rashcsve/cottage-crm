import { VisitListSkeleton } from "@/features/visits/components/VisitListSkeleton";
import { PageContent } from "@/shared/ui/page/PageContent";
import { PageHeader } from "@/shared/ui/page/PageHeader";
import { PageSection } from "@/shared/ui/page/PageSection";

export default function VisitsLoading() {
  return (
    <PageContent>
      <PageHeader title="Visits" description="" />

      <PageSection title="Visits">
        <VisitListSkeleton />
      </PageSection>
    </PageContent>
  );
}
