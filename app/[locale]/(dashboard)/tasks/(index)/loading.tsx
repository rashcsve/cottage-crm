import { getTranslations } from "next-intl/server";
import { TaskListSkeleton } from "@/features/tasks/components/TaskListSkeleton";
import { PageLayout } from "@/shared/ui/page/PageLayout";
import { SectionHeader } from "@/shared/ui/SectionHeader";
import { Skeleton } from "@/shared/ui/Skeleton";

export default async function TasksLoading() {
  const t = await getTranslations("tasks");
  const tCommon = await getTranslations("common");

  return (
    <PageLayout
      title={t("pageTitle")}
      size="wide"
    >
      <div className="space-y-7 lg:space-y-10" aria-busy="true">
        <section className="space-y-4 px-3.5 pb-3.5 sm:px-4 sm:pb-4">
          <SectionHeader
            title={t("sections.open.title")}
            description={t("sections.open.description")}
          />
          <Skeleton className="h-4 w-48" />
          <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-3 border-b border-border">
            <div className="flex gap-4 pb-2">
              <Skeleton className="h-7 w-24" />
              <Skeleton className="h-7 w-28" />
            </div>
            <Skeleton className="mb-2 h-11 w-32" />
          </div>
        </section>

        <section className="space-y-3">
          <div className="space-y-2">
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-full max-w-2xl" />
          </div>
          <TaskListSkeleton />
        </section>

        <span role="status" className="sr-only">
          {tCommon("loading")}
        </span>
      </div>
    </PageLayout>
  );
}
