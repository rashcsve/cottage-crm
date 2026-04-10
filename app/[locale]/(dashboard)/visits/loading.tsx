import { VisitListSkeleton } from "@/features/visits/components/VisitListSkeleton";
import { PageContent } from "@/shared/ui/page/PageContent";
import { PageHeader } from "@/shared/ui/page/PageHeader";
import { PageSection } from "@/shared/ui/page/PageSection";
import { getTranslations } from "next-intl/server";

export default async function VisitsLoading() {
  const t = await getTranslations("visits");

  return (
    <PageContent>
      <div className="space-y-6">
        <PageHeader
          title={t("pageTitle")}
          description={t("pageDescription")}
        />

        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            <PageSection title={t("list.title")} count={0}>
              <VisitListSkeleton />
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
