import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getTasksPageData } from "@/features/tasks/server/get-tasks-page-data";
import { TaskFilterSchema } from "@/features/tasks/schemas";
import { TasksPageBody } from "@/features/tasks/components/TasksPageBody";
import { PageContent } from "@/shared/ui/page/PageContent";
import { PageHeader } from "@/shared/ui/page/PageHeader";

export const metadata: Metadata = {
  title: "Tasks",
};

interface SearchParams {
  filter?: string | string[];
}

export default async function TasksPage({
  searchParams: searchParamsPromise,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const searchParams = await searchParamsPromise;

  const filterSchema = TaskFilterSchema.catch("open");
  const activeFilter = filterSchema.parse(searchParams?.filter);

  const [data, t] = await Promise.all([
    getTasksPageData(),
    getTranslations("tasks"),
  ]);

  return (
    <PageContent className="max-w-7xl space-y-6">
      <PageHeader title={t("pageTitle")} description={t("pageDescription")} />

      <TasksPageBody activeFilter={activeFilter} data={data} />
    </PageContent>
  );
}
