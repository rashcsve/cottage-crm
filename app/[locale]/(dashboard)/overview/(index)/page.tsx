import { connection } from "next/server";
import { getTranslations } from "next-intl/server";

import { createPageMetadata } from "@/app/[locale]/metadata";
import { DashboardOverview } from "@/features/dashboard/components/DashboardOverview";
import { startDashboardStreaming } from "@/features/dashboard/server/get-dashboard-overview-data";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { PageLayout } from "@/shared/ui/page/PageLayout";
import { toDateOnlyString } from "@/lib/utils/date";

export const generateMetadata = createPageMetadata("dashboard.overview");

export default async function OverviewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  await connection();
  await getCurrentProfile();
  const { locale } = await params;
  const todayIso = toDateOnlyString(new Date());

  const { visitsPromise, bulkPromise } = startDashboardStreaming(todayIso);

  const t = await getTranslations("dashboard.overview");

  return (
    <PageLayout
      title={t("pageTitle")}
      size="wide"
    >
      <DashboardOverview
        visitsPromise={visitsPromise}
        bulkPromise={bulkPromise}
        locale={locale}
        todayIso={todayIso}
      />
    </PageLayout>
  );
}
