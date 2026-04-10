import { getTranslations } from "next-intl/server";
import { PageContent } from "@/shared/ui/page/PageContent";
import { PageHeader } from "@/shared/ui/page/PageHeader";
import { PageSection } from "@/shared/ui/page/PageSection";
import { getVisitsPageData } from "@/features/visits/server/get-visits-page-data";
import { NewVisitForm } from "@/features/visits/components/forms/NewVisitForm";
import { VisitsList } from "@/features/visits/components/VisitsList";

export const metadata = {
  title: "Visits",
};

export default async function VisitsPage() {
  const [t, { visits, canManage }] = await Promise.all([
    getTranslations("visits"),
    getVisitsPageData(),
  ]);

  return (
    <PageContent>
      <div className="space-y-6">
        <PageHeader title={t("pageTitle")} description={t("pageDescription")} />

        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            <PageSection title={t("list.title")} count={visits.length}>
              <VisitsList visits={visits} canManageVisits={canManage} />
            </PageSection>
          </div>

          <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
            {canManage && <NewVisitForm />}
          </aside>
        </div>
      </div>
    </PageContent>
  );
}
