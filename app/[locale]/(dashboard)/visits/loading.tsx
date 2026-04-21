import { VisitsCalendarSkeleton } from "@/features/visits/components/calendar/VisitsCalendarSkeleton";
import { PageContent } from "@/shared/ui/page/PageContent";
import { PageHeader } from "@/shared/ui/page/PageHeader";
import { getTranslations } from "next-intl/server";

export default async function VisitsLoading() {
  const t = await getTranslations("visits");

  return (
    <PageContent className="max-w-7xl space-y-6">
      <PageHeader title={t("pageTitle")} description={t("pageDescription")} />
      <VisitsCalendarSkeleton />
    </PageContent>
  );
}
