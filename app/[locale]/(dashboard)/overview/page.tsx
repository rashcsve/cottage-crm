import { getTranslations } from "next-intl/server";

import { createPageMetadata } from "@/app/[locale]/metadata";
import { DashboardOverview } from "@/features/dashboard/components/DashboardOverview";
import { getDashboardOverviewData } from "@/features/dashboard/server/get-dashboard-overview-data";
import { PageLayout } from "@/shared/ui/page/PageLayout";

export const generateMetadata = createPageMetadata("dashboard.overview");
export const dynamic = "force-dynamic";

export default async function OverviewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const [data, t] = await Promise.all([
    getDashboardOverviewData(),
    getTranslations("dashboard.overview"),
  ]);

  return (
    <PageLayout
      title={t("pageTitle")}
      description={t("pageDescription")}
      size="wide"
    >
      <DashboardOverview data={data} locale={locale} />
    </PageLayout>
  );
}
