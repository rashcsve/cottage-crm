import { NewTaskForm } from "@/features/tasks/components/forms/NewTaskForm";
import { TaskPageHeader } from "@/features/tasks/components/TaskPageHeader";
import { TaskSection } from "@/features/tasks/components/TaskSection";
import { TaskSummary } from "@/features/tasks/components/TaskSummary";
import { TaskList } from "@/features/tasks/components/TaskList";
import { PageContent } from "@/shared/ui/PageContent";
import { getTasksPageData } from "@/features/tasks/server/get-tasks-page-data";
import { getActiveFilter } from "@/features/tasks/utils/getActiveFilter";
import { getListConfig } from "@/features/tasks/utils/getListConfig";

interface SearchParams {
  filter?: string | string[];
}

export default async function TasksPage({
  searchParams: searchParamsPromise,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const searchParams = await searchParamsPromise;
  const activeFilter = getActiveFilter(searchParams?.filter);

  const data = await getTasksPageData(activeFilter);
  const listConfig = getListConfig(activeFilter, data);

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
              eyebrow={listConfig.eyebrow}
              title={listConfig.title}
              description={listConfig.description}
              count={listConfig.count}
            >
              <TaskList
                tasks={listConfig.tasks}
                canManageTasks={data.canManage}
                emptyTitle={listConfig.emptyTitle}
                emptyDescription={listConfig.emptyDescription}
              />
            </TaskSection>
          </div>

          <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
            {data.canManage && <NewTaskForm id="new-task-form" />}

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
