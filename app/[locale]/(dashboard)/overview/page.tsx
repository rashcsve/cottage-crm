import { getTranslations } from "next-intl/server";

import { createPageMetadata } from "@/app/[locale]/metadata";
import { DashboardOverview } from "@/features/dashboard/components/DashboardOverview";
import { startDashboardStreaming } from "@/features/dashboard/server/get-dashboard-overview-data";
import { PageLayout } from "@/shared/ui/page/PageLayout";
import { toDateOnlyString } from "@/lib/utils/date";

export const generateMetadata = createPageMetadata("dashboard.overview");

export default async function OverviewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const todayIso = toDateOnlyString(new Date());

  const { visitsPromise, bulkPromise } = startDashboardStreaming(todayIso);

  const t = await getTranslations("dashboard.overview");

  return (
    <PageLayout
      title={t("pageTitle")}
      description={t("pageDescription")}
      size="wide"
    >
      <DashboardOverview
        visitsPromise={visitsPromise}
        bulkPromise={bulkPromise}
        todayIso={todayIso}
        locale={locale}
      />
    </PageLayout>
  );
}
