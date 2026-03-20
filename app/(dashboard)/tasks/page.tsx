import { CompletedTasksSection } from "@/features/tasks/components/CompletedTasksSection";
import { NewTaskForm } from "@/features/tasks/components/forms/NewTaskForm";
import { TaskPageHeader } from "@/features/tasks/components/TaskPageHeader";
import { TaskSection } from "@/features/tasks/components/TaskSection";
import { TaskSummary } from "@/features/tasks/components/TaskSummary";
import { TaskList } from "@/features/tasks/components/TaskList";
import { PageContent } from "@/shared/ui/PageContent";
import { getTasksPageData } from "@/features/tasks/server/get-tasks-page-data";

export default async function TasksPage() {
  const data = await getTasksPageData();

  return (
    <PageContent>
      <div className="space-y-6">
        <TaskPageHeader
          pendingCount={data.pendingCount}
          overdueCount={data.overdueCount}
          completionRate={data.completionRate}
          canManage={data.canManage}
        />

        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            <TaskSection
              eyebrow="Práce kolem chaty"
              title="Otevřené úkoly"
              description="To hlavní, co je potřeba udělat teď."
              count={data.pendingCount}
            >
              <TaskList
                tasks={data.pendingTasks}
                canManageTasks={data.canManage}
                emptyTitle="Žádné otevřené úkoly"
                emptyDescription="Všechno důležité je hotové."
              />
            </TaskSection>

            <CompletedTasksSection
              completedTasks={data.recentDoneTasks}
              totalCount={data.doneCount}
              canManageTasks={data.canManage}
            />
          </div>

          <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
            {data.canManage && <NewTaskForm id="new-task-form" />}

            <TaskSummary
              totalCount={data.totalCount}
              pendingCount={data.pendingCount}
              doneCount={data.doneCount}
              overdueCount={data.overdueCount}
              completionRate={data.completionRate}
            />
          </aside>
        </div>
      </div>
    </PageContent>
  );
}
