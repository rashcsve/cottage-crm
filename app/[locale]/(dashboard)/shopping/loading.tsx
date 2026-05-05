import { ShoppingListSkeleton } from "@/features/shopping/components/ShoppingListSkeleton";
import { PageLayout } from "@/shared/ui/page/PageLayout";
import { getTranslations } from "next-intl/server";

export default async function ShoppingLoading() {
  const tShopping = await getTranslations("shopping");

  return (
    <PageLayout
      title={tShopping("pageTitle")}
      description={tShopping("pageDescription")}
      size="wide"
    >
      <div className="space-y-4 sm:space-y-5">
        <section className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
          <div className="space-y-5 p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">
                  {tShopping("summary.eyebrow")}
                </p>

                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 className="text-lg font-semibold text-stone-900">
                    {tShopping("summary.title")}
                  </h2>
                  <div className="h-6 w-10 animate-pulse rounded-full bg-stone-100" />
                </div>

                <p className="max-w-2xl text-sm text-stone-600">
                  {tShopping("summary.description")}
                </p>
              </div>
            </div>

            <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center xl:justify-between">
              <div className="grid w-full grid-cols-2 rounded-2xl border border-stone-200 bg-stone-50 p-1 sm:w-auto sm:min-w-56">
                <div className="h-10 animate-pulse rounded-xl bg-white" />
                <div className="h-10 animate-pulse rounded-xl bg-stone-50" />
              </div>

              <div className="h-11 w-full animate-pulse rounded-xl bg-stone-100 sm:w-32" />
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-stone-200 bg-stone-50/70 p-4 shadow-sm sm:p-5">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="h-3.5 w-28 animate-pulse rounded-full bg-stone-100" />
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="h-7 w-40 animate-pulse rounded-lg bg-stone-100" />
                <div className="h-6 w-12 animate-pulse rounded-full bg-stone-100" />
              </div>
              <div className="h-4 w-full max-w-2xl animate-pulse rounded-lg bg-stone-100" />
            </div>

            <ShoppingListSkeleton variant="plain" />
          </div>
        </section>
      </div>
    </PageLayout>
  );
}
