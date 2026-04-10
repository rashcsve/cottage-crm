import { getTranslations } from "next-intl/server";
import { getTasksPageData } from "@/features/tasks/server/get-tasks-page-data";
import { TaskFilterSchema } from "@/features/tasks/schemas";
import {
  TaskFilterNav,
  type TaskFilterNavItem,
} from "@/features/tasks/components/TaskFilterNav";
import {
  TasksPageBody,
  type TasksPageSectionLabels,
} from "@/features/tasks/components/TasksPageBody";
import { PageContent } from "@/shared/ui/page/PageContent";
import { PageHeader } from "@/shared/ui/page/PageHeader";

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

  const filterItems: TaskFilterNavItem[] = [
    {
      label: t("header.filters.open"),
      value: data.openCount,
      filter: "open",
    },
    {
      label: t("header.filters.done"),
      value: data.doneCount,
      filter: "done",
    },
  ];

  const sectionLabels: TasksPageSectionLabels = {
    open: {
      emptyTitle: t("sections.open.emptyTitle"),
      emptyDescription: t("sections.open.emptyDescription"),
    },
    overdue: {
      title: t("sections.overdue.title"),
      emptyTitle: t("sections.overdue.emptyTitle"),
      emptyDescription: t("sections.overdue.emptyDescription"),
    },
    onTrack: {
      title: t("sections.onTrack.title"),
      emptyTitle: t("sections.onTrack.emptyTitle"),
      emptyDescription: t("sections.onTrack.emptyDescription"),
    },
    done: {
      title: t("sections.done.title"),
      emptyTitle: t("sections.done.emptyTitle"),
      emptyDescription: t("sections.done.emptyDescription"),
    },
  };

  return (
    <PageContent className="space-y-6">
      <PageHeader title={t("pageTitle")} description={t("pageDescription")}>
        <TaskFilterNav
          activeFilter={activeFilter}
          items={filterItems}
          ariaLabel={t("aria.filterNavigation")}
        />
      </PageHeader>

      <TasksPageBody
        activeFilter={activeFilter}
        data={data}
        sectionLabels={sectionLabels}
      />
    </PageContent>
  );
}
