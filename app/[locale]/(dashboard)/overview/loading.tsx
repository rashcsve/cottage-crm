import { getTranslations } from "next-intl/server";

import {
  PresenceSkeleton,
  StatsSkeleton,
  WeatherSkeleton,
} from "@/features/dashboard/components/DashboardSkeletons";
import { PageLayout } from "@/shared/ui/page/PageLayout";
import { Skeleton } from "@/shared/ui/Skeleton";

export default async function OverviewLoading() {
  const t = await getTranslations("dashboard.overview");

  return (
    <PageLayout
      title={t("pageTitle")}
      description={t("pageDescription")}
      descriptionClassName="lg:hidden"
      size="wide"
    >
      <div className="flex flex-wrap gap-7 lg:gap-6">
        <div className="flex min-w-0 shrink grow basis-85 flex-col gap-7 lg:gap-6">
          <PresenceSkeleton />
          <Skeleton className="h-12 w-full" />
          <WeatherSkeleton />
        </div>
        <div className="min-w-0 shrink grow-2 basis-140">
          <StatsSkeleton />
        </div>
      </div>
    </PageLayout>
  );
}
