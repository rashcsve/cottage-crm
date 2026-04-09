import { ShoppingListSkeleton } from "@/features/shopping/components/ShoppingListSkeleton";
import { PageContent } from "@/shared/ui/page/PageContent";
import { PageHeader } from "@/shared/ui/page/PageHeader";
import { PageSection } from "@/shared/ui/page/PageSection";
import { getTranslations } from "next-intl/server";

export default async function ShoppingLoading() {
  const [tCommon, tShopping] = await Promise.all([
    getTranslations("common"),
    getTranslations("shopping"),
  ]);

  return (
    <PageContent>
      <div className="space-y-6">
        <PageHeader
          title={tShopping("pageTitle")}
          description={tShopping("pageDescription")}
        />

        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            <PageSection
              variant="card"
              eyebrow={tCommon("loading")}
              title={tShopping("sections.pending.title")}
              description={tShopping("sections.pending.description")}
              count={0}
            >
              <ShoppingListSkeleton />
            </PageSection>

            <PageSection
              variant="card"
              eyebrow={tCommon("loading")}
              title={tShopping("sections.purchased.title")}
              description={tShopping("sections.purchased.description")}
              count={0}
            >
              <ShoppingListSkeleton />
            </PageSection>
          </div>

          <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
            <div className="h-16 w-full animate-pulse rounded-2xl bg-stone-200" />
          </aside>
        </div>
      </div>
    </PageContent>
  );
}
