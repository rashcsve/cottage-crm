import { NewTaskForm } from "@/features/tasks/components/forms/NewTaskForm";
import { TaskPageHeader } from "@/features/tasks/components/TaskPageHeader";
import { TaskSection } from "@/features/tasks/components/TaskSection";
import { TaskSummary } from "@/features/tasks/components/TaskSummary";
import { TaskList } from "@/features/tasks/components/TaskList";
import { PageContent } from "@/shared/ui/PageContent";
import { getTasksPageData } from "@/features/tasks/server/get-tasks-page-data";
import { getTranslations } from "next-intl/server";
import { getFilteredListFromCategorized } from "@/features/tasks/domain/task-categorization";
import { TaskFilterSchema } from "@/features/tasks/schemas";

interface SearchParams {
  filter?: string | string[];
}

export default async function TasksPage({
  searchParams: searchParamsPromise,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const searchParams = await searchParamsPromise;

  const filterSchema = TaskFilterSchema.catch("pending");
  const activeFilter = filterSchema.parse(searchParams?.filter);

  const [data, t] = await Promise.all([
    getTasksPageData(),
    getTranslations("tasks"),
  ]);

  const filteredList = getFilteredListFromCategorized(data, activeFilter);

  const sectionLabels = {
    eyebrow: t(`sections.${activeFilter}.eyebrow`),
    title: t(`sections.${activeFilter}.title`),
    description: t(`sections.${activeFilter}.description`),
    emptyTitle: t(`sections.${activeFilter}.emptyTitle`),
    emptyDescription: t(`sections.${activeFilter}.emptyDescription`),
  };

  return (
    <PageContent>
      <div className="space-y-6">
        <TaskPageHeader
          pendingCount={data.pendingCount}
          overdueCount={data.overdueCount}
          doneCount={data.doneCount}
          canManage={data.canManage}
          activeFilter={activeFilter}
        />

        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            <TaskSection
              eyebrow={sectionLabels.eyebrow}
              title={sectionLabels.title}
              description={sectionLabels.description}
              count={filteredList.count}
            >
              <TaskList
                initialTasks={filteredList.tasks}
                canManageTasks={data.canManage}
                emptyTitle={sectionLabels.emptyTitle}
                emptyDescription={sectionLabels.emptyDescription}
              />
            </TaskSection>
          </div>

          <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
            {data.canManage && <NewTaskForm />}

            <TaskSummary
              totalCount={data.totalCount}
              overdueCount={data.overdueCount}
              completionRate={data.completionRate}
            />
          </aside>
        </div>
      </div>
    </PageContent>
  );
}
