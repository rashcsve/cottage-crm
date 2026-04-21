import { getTranslations } from "next-intl/server";
import { PageContent } from "@/shared/ui/page/PageContent";
import { PageHeader } from "@/shared/ui/page/PageHeader";
import { getVisitsPageData } from "@/features/visits/server/get-visits-page-data";
import { VisitsCalendar } from "@/features/visits/components/calendar/VisitsCalendar";
import {
  readVisitsCalendarUrlState,
  type VisitsCalendarSearchParamsInput,
} from "@/features/visits/application/calendar/visits-calendar-url-state";

export const metadata = {
  title: "Visits",
};

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
    <PageContent className="max-w-7xl space-y-6">
      <PageHeader title={t("pageTitle")} description={t("pageDescription")} />

      <VisitsCalendar
        visits={visits}
        canManageVisits={canManage}
        todayIso={todayIso}
        currentUserName={currentUserName}
        initialUrlState={initialUrlState}
      />
    </PageContent>
  );
}
