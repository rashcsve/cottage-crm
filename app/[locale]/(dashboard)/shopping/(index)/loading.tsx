import { getTranslations } from "next-intl/server";
import { ShoppingListSkeleton } from "@/features/shopping/components/ShoppingListSkeleton";
import { PageLayout } from "@/shared/ui/page/PageLayout";
import { SectionHeader } from "@/shared/ui/SectionHeader";
import { Skeleton } from "@/shared/ui/Skeleton";

export default async function ShoppingLoading() {
  const t = await getTranslations("shopping");
  const tCommon = await getTranslations("common");

  return (
    <PageLayout
      title={t("pageTitle")}
      size="wide"
    >
      <div className="space-y-4" aria-busy="true">
        <section className="space-y-4 px-3.5 pb-3.5 sm:px-4 sm:pb-4">
          <SectionHeader title={t("sections.pending.title")} />
          <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-3 border-b border-border">
            <div className="flex gap-4 pb-2">
              <Skeleton className="h-7 w-24" />
              <Skeleton className="h-7 w-24" />
            </div>
            <Skeleton className="mb-2 h-11 w-32" />
          </div>
        </section>

        <ShoppingListSkeleton />

        <span role="status" className="sr-only">
          {tCommon("loading")}
        </span>
      </div>
    </PageLayout>
  );
}
