import { getTranslations } from "next-intl/server";
import { TaskListSkeleton } from "@/features/tasks/components/TaskListSkeleton";
import { PageLayout } from "@/shared/ui/page/PageLayout";
import { Skeleton } from "@/shared/ui/Skeleton";

const PINNED_BAR_STYLE = {
  paddingLeft: "var(--safe-area-left)",
  paddingRight: "var(--safe-area-right)",
};


export default async function TasksLoading() {
  const t = await getTranslations("tasks");
  const tCommon = await getTranslations("common");

  return (
    <PageLayout
      title={t("pageTitle")}
      size="wide"
    >
      <div className="space-y-2" aria-busy="true">
        <section className="space-y-3 px-3.5 pb-3.5 sm:px-4 sm:pb-4">
          <div className="flex items-center justify-between gap-3">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="hidden h-11 w-32 rounded-control lg:block" />
          </div>
          <div className="flex gap-1 rounded-control bg-muted p-1">
            <Skeleton className="h-11 flex-1 rounded-control" />
            <Skeleton className="h-11 flex-1 rounded-control" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-11 w-14 rounded-full" />
            <Skeleton className="h-11 w-24 rounded-full" />
            <Skeleton className="h-11 w-20 rounded-full" />
          </div>
        </section>

        <div className="space-y-7 pb-20 lg:space-y-10 lg:pb-0">
          <Skeleton className="mx-4 h-5 w-40 lg:mx-6" />
          <TaskListSkeleton />
        </div>

        <div
          className="fixed inset-x-0 bottom-(--mobile-nav-height,0px) z-20 border-t border-border bg-surface lg:hidden"
          style={PINNED_BAR_STYLE}
          aria-hidden="true"
        >
          <div className="mx-auto max-w-page px-5 py-3">
            <Skeleton className="h-12 w-full rounded-control" />
          </div>
        </div>

        <span role="status" className="sr-only">
          {tCommon("loading")}
        </span>
      </div>
    </PageLayout>
  );
}
