import { getVisitsPageData } from "@/features/visits/server/get-visits-page-data";
import { VisitsCalendar } from "@/features/visits/components/calendar/VisitsCalendar";
import {
  readVisitsCalendarUrlState,
  type VisitsCalendarSearchParamsInput,
} from "@/features/visits/application/calendar/visits-calendar-url-state";
import { createPageMetadata } from "@/app/[locale]/metadata";
import { PageLayout } from "@/shared/ui/page/PageLayout";
import { getTranslations } from "next-intl/server";

export const generateMetadata = createPageMetadata("visits");

export default async function VisitsPage({
  searchParams: searchParamsPromise,
}: {
  searchParams: Promise<VisitsCalendarSearchParamsInput>;
}) {
  const rawSearchParams = await searchParamsPromise;
  const [t, { visits, canManage, todayIso, currentUserName }] = await Promise.all([
    getTranslations("visits"),
    getVisitsPageData(),
  ]);
  const initialUrlState = readVisitsCalendarUrlState(rawSearchParams, todayIso);

  return (
    <PageLayout
      title={t("pageTitle")}
      description={t("pageDescription")}
      size="wide"
    >
      <VisitsCalendar
        visits={visits}
        canManageVisits={canManage}
        todayIso={todayIso}
        currentUserName={currentUserName}
        initialUrlState={initialUrlState}
      />
    </PageLayout>
  );
}
