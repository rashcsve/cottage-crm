import { getTranslations } from "next-intl/server";
import { ShoppingListSkeleton } from "@/features/shopping/components/ShoppingListSkeleton";
import { PageLayout } from "@/shared/ui/page/PageLayout";
import { Skeleton } from "@/shared/ui/Skeleton";

export default async function ShoppingLoading() {
  const t = await getTranslations("shopping");
  const tCommon = await getTranslations("common");

  return (
    <PageLayout
      title={t("pageTitle")}
      size="wide"
    >
      <div className="space-y-2" aria-busy="true">
        <section className="space-y-3 px-3.5 pb-1 sm:px-4 sm:pb-4">
          <Skeleton className="h-5 w-40" />
          <div className="flex gap-1 rounded-control bg-muted p-1 md:w-80">
            <Skeleton className="h-11 flex-1 rounded-control" />
            <Skeleton className="h-11 flex-1 rounded-control" />
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
