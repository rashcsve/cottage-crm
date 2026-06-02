import { PageLayout } from "@/shared/ui/page/PageLayout";
import { Surface } from "@/shared/ui/Surface";
import { getTranslations } from "next-intl/server";

function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-stone-100 ${className}`} />;
}

function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div
      className={`overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm ${className}`}
    />
  );
}

export default async function OverviewLoading() {
  const t = await getTranslations("dashboard.overview");

  return (
    <PageLayout title={t("pageTitle")} description={t("pageDescription")} size="wide">
      <div className="space-y-4">
        <section className="grid gap-3 lg:grid-cols-[minmax(0,1.45fr)_minmax(18rem,0.75fr)]">
          <Surface className="overflow-hidden">
            <div className="px-4 py-3.5">
              <div className="flex flex-col gap-2.5 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1.5">
                  <SkeletonBlock className="h-3 w-40" />
                  <SkeletonBlock className="h-6 w-48" />
                  <SkeletonBlock className="h-4 w-72" />
                </div>
                <SkeletonBlock className="h-6 w-20 rounded-full" />
              </div>
            </div>
            <div className="border-t border-stone-200 px-4 py-3.5">
              <div className="space-y-2">
                <SkeletonBlock className="h-5 w-56" />
                <SkeletonBlock className="h-4 w-36" />
              </div>
            </div>
          </Surface>

          <Surface className="overflow-hidden">
            <div className="px-4 py-3.5 space-y-2.5">
              <SkeletonBlock className="h-3 w-24" />
              <SkeletonBlock className="h-6 w-40" />
            </div>
            <div className="border-t border-stone-200 px-4 py-3.5 space-y-3">
              <div className="flex justify-between">
                <SkeletonBlock className="h-8 w-20" />
                <SkeletonBlock className="h-8 w-20" />
              </div>
              <SkeletonBlock className="h-4 w-full" />
              <SkeletonBlock className="h-4 w-3/4" />
            </div>
          </Surface>
        </section>

        <section aria-label={t("summary.ariaLabel")} className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} className="p-3.5">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1.5">
                  <SkeletonBlock className="h-3 w-16" />
                  <SkeletonBlock className="h-7 w-10" />
                </div>
                <SkeletonBlock className="h-9 w-9 rounded-xl" />
              </div>
              <SkeletonBlock className="mt-2 h-4 w-full" />
            </SkeletonCard>
          ))}
        </section>

        <section className="grid items-start gap-2.5 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Surface key={i} className="p-3 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <SkeletonBlock className="h-2.5 w-16" />
                  <SkeletonBlock className="h-4 w-28" />
                </div>
                <SkeletonBlock className="h-5 w-8 rounded-full" />
              </div>
              <div className="divide-y divide-stone-200">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="py-1 first:pt-0 last:pb-0 space-y-1">
                    <SkeletonBlock className="h-4 w-full" />
                    <SkeletonBlock className="h-3 w-3/4" />
                  </div>
                ))}
              </div>
              <SkeletonBlock className="h-4 w-24" />
            </Surface>
          ))}
        </section>
      </div>
    </PageLayout>
  );
}
