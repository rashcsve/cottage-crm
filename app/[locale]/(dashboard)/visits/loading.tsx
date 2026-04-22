import { VisitsCalendarSkeleton } from "@/features/visits/components/calendar/VisitsCalendarSkeleton";
import { PageLayout } from "@/shared/ui/page/PageLayout";
import { getTranslations } from "next-intl/server";

export default async function VisitsLoading() {
  const t = await getTranslations("visits");

  return (
    <PageLayout
      title={t("pageTitle")}
      description={t("pageDescription")}
      size="wide"
    >
      <VisitsCalendarSkeleton />
    </PageLayout>
  );
}
