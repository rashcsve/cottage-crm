import { ShoppingListSkeleton } from "@/features/shopping/components/ShoppingListSkeleton";
import { PageContent } from "@/shared/ui/page/PageContent";
import { PageSection } from "@/shared/ui/PageSections";
import { StatCard } from "@/shared/ui/StatCard";

export default function ShoppingLoading() {
  return (
    <PageContent>
      {/* Header skeleton */}
      <div className="mb-6 space-y-2">
        <div className="h-6 w-40 animate-pulse rounded bg-stone-200" />
        <div className="h-4 w-64 animate-pulse rounded bg-stone-200" />
      </div>

      {/* Stats skeleton */}
      <section className="mb-8 grid gap-3 sm:grid-cols-2">
        <StatCard label="Chybí" value={0} />
        <StatCard label="Vyřešeno" value={0} />
      </section>

      {/* Form skeleton */}
      <div className="mb-8 h-16 w-full animate-pulse rounded-lg bg-stone-200" />

      {/* Lists skeleton */}
      <div className="space-y-8">
        <PageSection title="Chybí">
          <ShoppingListSkeleton />
        </PageSection>

        <PageSection title="Vyřešeno">
          <ShoppingListSkeleton />
        </PageSection>
      </div>
    </PageContent>
  );
}
