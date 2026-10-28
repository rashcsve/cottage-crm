import { getTranslations } from "next-intl/server";
import { TaskListSkeleton } from "@/features/tasks/components/TaskListSkeleton";
import { PageLayout } from "@/shared/ui/page/PageLayout";
import { Skeleton } from "@/shared/ui/Skeleton";

export default async function TasksLoading() {
  const t = await getTranslations("tasks");
  const tCommon = await getTranslations("common");

  return (
    <PageLayout
      title={t("pageTitle")}
      size="wide"
    >
      <div className="space-y-2" aria-busy="true">
        <section className="space-y-4 px-3.5 pb-3.5 sm:px-4 sm:pb-4">
          <div className="flex items-center gap-x-3">
            <Skeleton className="h-7 w-40" />
            <Skeleton className="h-5 w-6" />
          </div>
          <div className="flex gap-6 border-b border-border pb-2">
            <Skeleton className="h-7 w-24" />
            <Skeleton className="h-7 w-28" />
          </div>
        </section>

        <TaskListSkeleton />

        <span role="status" className="sr-only">
          {tCommon("loading")}
        </span>
      </div>
    </PageLayout>
  );
}
