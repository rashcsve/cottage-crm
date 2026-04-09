import { TaskSection } from "@/features/tasks/components/TaskSection";
import { TaskListSkeleton } from "@/features/tasks/components/TaskListSkeleton";
import { PageContent } from "@/shared/ui/page/PageContent";
import { getTranslations } from "next-intl/server";

export default async function TasksLoading() {
  const [tCommon, tTasks] = await Promise.all([
    getTranslations("common"),
    getTranslations("tasks"),
  ]);

  return (
    <PageContent>
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="h-6 w-32 animate-pulse rounded bg-stone-200" />
          <div className="h-10 w-64 animate-pulse rounded bg-stone-200" />
          <div className="flex gap-4">
            <div className="h-9 w-24 animate-pulse rounded-lg bg-stone-200" />
            <div className="h-9 w-24 animate-pulse rounded-lg bg-stone-200" />
            <div className="h-9 w-24 animate-pulse rounded-lg bg-stone-200" />
          </div>
        </div>

        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            <TaskSection
              eyebrow={tCommon("loading")}
              title={tTasks("pageTitle")}
              description=""
              count={0}
            >
              <TaskListSkeleton />
            </TaskSection>
          </div>

          <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
            <div className="h-96 w-full animate-pulse rounded-2xl bg-stone-200" />
          </aside>
        </div>
      </div>
    </PageContent>
  );
}
