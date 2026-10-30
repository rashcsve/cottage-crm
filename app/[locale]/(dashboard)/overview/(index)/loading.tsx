import { getTranslations } from "next-intl/server";

import { DashboardPlanVisitLink } from "@/features/dashboard/components/DashboardPlanVisitLink";
import {
  PresenceSkeleton,
  PreviewSectionSkeleton,
  WeatherSkeleton,
} from "@/features/dashboard/components/DashboardSkeletons";
import { MobileActionBar } from "@/shared/ui/MobileActionBar";
import { PageLayout } from "@/shared/ui/page/PageLayout";

export default async function OverviewLoading() {
  const t = await getTranslations("dashboard.overview");
  const planVisitLink = <DashboardPlanVisitLink label={t("planVisit")} />;

  return (
    <PageLayout
      title={t("pageTitle")}
      size="wide"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:gap-6">
        <div className="contents lg:flex lg:min-w-0 lg:shrink lg:grow lg:basis-85 lg:flex-col lg:gap-6">
          <PresenceSkeleton />
          <div className="hidden lg:block">{planVisitLink}</div>
          <div className="order-last lg:order-none">
            <WeatherSkeleton />
          </div>
        </div>
        <div className="min-w-0 lg:shrink lg:grow-2 lg:basis-140">
          <PreviewSectionSkeleton />
        </div>
      </div>

      <MobileActionBar>{planVisitLink}</MobileActionBar>
    </PageLayout>
  );
}
