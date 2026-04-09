import { ShoppingListSkeleton } from "@/features/shopping/components/ShoppingListSkeleton";
import { PageContent } from "@/shared/ui/page/PageContent";
import { PageSection } from "@/shared/ui/PageSections";
import { StatCard } from "@/shared/ui/StatCard";
import { getTranslations } from "next-intl/server";

export default async function ShoppingLoading() {
  const tShopping = await getTranslations("shopping");

  return (
    <PageContent>
      {/* Header skeleton */}
      <div className="mb-6 space-y-2">
        <div className="h-6 w-40 animate-pulse rounded bg-stone-200" />
        <div className="h-4 w-64 animate-pulse rounded bg-stone-200" />
      </div>

      {/* Stats skeleton */}
      <section className="mb-8 grid gap-3 sm:grid-cols-2">
        <StatCard label={tShopping("summary.pending")} value={0} />
        <StatCard label={tShopping("summary.purchased")} value={0} />
      </section>

      {/* Form skeleton */}
      <div className="mb-8 h-16 w-full animate-pulse rounded-lg bg-stone-200" />

      {/* Lists skeleton */}
      <div className="space-y-8">
        <PageSection title={tShopping("sections.pending.title")}>
          <ShoppingListSkeleton />
        </PageSection>

        <PageSection title={tShopping("sections.purchased.title")}>
          <ShoppingListSkeleton />
        </PageSection>
      </div>
    </PageContent>
  );
}
