import { getTranslations } from "next-intl/server";
import { getTasksPageData } from "@/features/tasks/server/get-tasks-page-data";
import { parseTasksSearchParams } from "@/features/tasks/schemas";
import { TasksPageBody } from "@/features/tasks/components/TasksPageBody";
import { PageLayout } from "@/shared/ui/page/PageLayout";
import { createPageMetadata } from "@/app/[locale]/metadata";

export const generateMetadata = createPageMetadata("tasks");

interface SearchParams {
  filter?: string | string[];
  due?: string | string[];
}

export default async function TasksPage({
  searchParams: searchParamsPromise,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const searchParams = await searchParamsPromise;

  const { activeFilter, activeDue } = parseTasksSearchParams(searchParams);

  const [data, t] = await Promise.all([
    getTasksPageData(),
    getTranslations("tasks"),
  ]);

  return (
    <PageLayout
      title={t("pageTitle")}
      size="wide"
    >
      <TasksPageBody
        activeFilter={activeFilter}
        activeDue={activeDue}
        data={data}
      />
    </PageLayout>
  );
}
