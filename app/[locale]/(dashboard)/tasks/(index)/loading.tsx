import { getTranslations } from "next-intl/server";
import { TaskListSkeleton } from "@/features/tasks/components/TaskListSkeleton";
import { PageLayout } from "@/shared/ui/page/PageLayout";
import { MobileActionBar } from "@/shared/ui/MobileActionBar";
import { Skeleton } from "@/shared/ui/Skeleton";

export default async function TasksLoading() {
  const t = await getTranslations("tasks");
  const tCommon = await getTranslations("common");

  return (
    <PageLayout
      title={t("pageTitle")}
      size="wide"
    >
      <div aria-busy="true">
        <div className="space-y-2">
          <section className="space-y-3 px-3.5 pb-1 sm:px-4 sm:pb-4">
            <div className="flex items-center justify-between gap-3">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="hidden h-11 w-32 rounded-control lg:block" />
            </div>
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <div className="flex gap-1 rounded-control bg-muted p-1 md:w-80 md:shrink-0">
                <Skeleton className="h-11 flex-1 rounded-control" />
                <Skeleton className="h-11 flex-1 rounded-control" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-11 w-14 rounded-full" />
                <Skeleton className="h-11 w-24 rounded-full" />
                <Skeleton className="h-11 w-20 rounded-full" />
              </div>
            </div>
          </section>

          <div className="space-y-7 lg:space-y-10">
            <Skeleton className="mx-4 h-5 w-40 lg:mx-6" />
            <TaskListSkeleton />
          </div>
        </div>

        <MobileActionBar>
          <Skeleton className="h-12 w-full rounded-control" />
        </MobileActionBar>

        <span role="status" className="sr-only">
          {tCommon("loading")}
        </span>
      </div>
    </PageLayout>
  );
}
