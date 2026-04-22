import { getTranslations } from "next-intl/server";
import { TaskListSkeleton } from "@/features/tasks/components/TaskListSkeleton";
import { PageContent } from "@/shared/ui/page/PageContent";
import { PageHeader } from "@/shared/ui/page/PageHeader";

export default async function TasksLoading() {
  const t = await getTranslations("tasks");

  return (
    <PageContent className="max-w-7xl space-y-6">
      <PageHeader title={t("pageTitle")} description={t("pageDescription")} />

      <div className="space-y-4 sm:space-y-5">
        <section className="overflow-hidden rounded-4xl border border-stone-200 bg-white shadow-sm">
          <div className="space-y-5 p-4 sm:p-5">
            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">
                  {t("sections.open.eyebrow")}
                </p>

                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 className="text-lg font-semibold text-stone-900">
                    {t("sections.open.title")}
                  </h2>
                  <div className="h-6 w-10 animate-pulse rounded-full bg-stone-100" />
                </div>

                <p className="max-w-2xl text-sm text-stone-600">
                  {t("sections.open.description")}
                </p>
              </div>

              <div className="-mx-1 flex gap-2 overflow-hidden px-1 pb-1 sm:mx-0 sm:px-0 sm:pb-0">
                <div className="h-9 w-24 animate-pulse rounded-full bg-stone-100" />
                <div className="h-9 w-28 animate-pulse rounded-full bg-stone-100" />
                <div className="h-9 w-28 animate-pulse rounded-full bg-stone-100" />
              </div>
            </div>

            <div className="flex min-w-0 flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div className="grid w-full grid-cols-2 rounded-2xl border border-stone-200 bg-stone-50 p-1 sm:w-auto sm:min-w-[14rem]">
                <div className="h-10 animate-pulse rounded-xl bg-white" />
                <div className="h-10 animate-pulse rounded-xl bg-stone-50" />
              </div>

              <div className="h-11 w-full animate-pulse rounded-xl bg-stone-100 sm:w-32" />
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-stone-200 bg-stone-50/70 p-4 shadow-sm sm:rounded-4xl sm:p-5">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="h-3.5 w-28 animate-pulse rounded-full bg-stone-100" />
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="h-7 w-40 animate-pulse rounded-lg bg-stone-100" />
                <div className="h-6 w-12 animate-pulse rounded-full bg-stone-100" />
              </div>
              <div className="h-4 w-full max-w-2xl animate-pulse rounded-lg bg-stone-100" />
            </div>

            <TaskListSkeleton variant="plain" />
          </div>
        </section>
      </div>
    </PageContent>
  );
}
