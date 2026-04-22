import { getTranslations } from "next-intl/server";
import { TaskListSkeleton } from "@/features/tasks/components/TaskListSkeleton";
import { Surface } from "@/shared/ui/Surface";
import { PageContent } from "@/shared/ui/page/PageContent";
import { PageHeader } from "@/shared/ui/page/PageHeader";

export default async function TasksLoading() {
  const t = await getTranslations("tasks");

  return (
    <PageContent className="space-y-6">
      <PageHeader title={t("pageTitle")} description={t("pageDescription")}>
        <div className="inline-flex rounded-2xl bg-stone-100 p-1">
          <div className="h-9 w-24 animate-pulse rounded-xl bg-white" />
          <div className="h-9 w-24 animate-pulse rounded-xl bg-stone-100" />
        </div>
      </PageHeader>

      <Surface className="overflow-hidden">
        <div className="flex justify-start border-b border-stone-200 px-4 py-3 sm:justify-end sm:px-5">
          <div className="h-9 w-28 animate-pulse rounded-xl bg-stone-100" />
        </div>

        <TaskListSkeleton variant="plain" />
      </Surface>
    </PageContent>
  );
}
