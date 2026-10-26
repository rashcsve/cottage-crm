import { VisitsCalendarSkeleton } from "@/features/visits/components/calendar/VisitsCalendarSkeleton";
import { PageLayout } from "@/shared/ui/page/PageLayout";
import { getTranslations } from "next-intl/server";

export default async function VisitsLoading() {
  const t = await getTranslations("visits");
  const tCommon = await getTranslations("common");

  return (
    <PageLayout
      title={t("pageTitle")}
      description={t("pageDescription")}
      descriptionClassName="lg:hidden"
      size="wide"
    >
      <div aria-busy="true">
        <VisitsCalendarSkeleton />

        <span role="status" className="sr-only">
          {tCommon("loading")}
        </span>
      </div>
    </PageLayout>
  );
}
