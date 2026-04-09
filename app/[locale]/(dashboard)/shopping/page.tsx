import { getTranslations } from "next-intl/server";
import { ShoppingList } from "@/features/shopping/components/ShoppingList";
import { AddShoppingItemForm } from "@/features/shopping/components/forms/AddShoppingItemForm";
import { PageHeader } from "@/shared/ui/page/PageHeader";
import { PageSection } from "@/shared/ui/page/PageSection";
import { PageContent } from "@/shared/ui/page/PageContent";
import { getShoppingPageData } from "@/features/shopping/server/get-shopping-page-data";

export default async function ShoppingPage() {
  const [data, t] = await Promise.all([
    getShoppingPageData(),
    getTranslations("shopping"),
  ]);

  const pendingSectionLabels = {
    eyebrow: t("sections.pending.eyebrow"),
    title: t("sections.pending.title"),
    description: t("sections.pending.description"),
    emptyTitle: t("empty.pending.title"),
    emptyDescription: t("empty.pending.description"),
  };

  const purchasedSectionLabels = {
    eyebrow: t("sections.purchased.eyebrow"),
    title: t("sections.purchased.title"),
    description: t("sections.purchased.description"),
    emptyTitle: t("empty.purchased.title"),
    emptyDescription: t("empty.purchased.description"),
  };

  return (
    <PageContent>
      <div className="space-y-6">
        <PageHeader title={t("pageTitle")} description={t("pageDescription")} />

        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            <PageSection
              variant="card"
              eyebrow={pendingSectionLabels.eyebrow}
              title={pendingSectionLabels.title}
              description={pendingSectionLabels.description}
              count={data.pendingItems.length}
            >
              <ShoppingList
                items={data.pendingItems}
                canManageItems={data.canManage}
                emptyTitle={pendingSectionLabels.emptyTitle}
                emptyDescription={pendingSectionLabels.emptyDescription}
              />
            </PageSection>

            <PageSection
              variant="card"
              eyebrow={purchasedSectionLabels.eyebrow}
              title={purchasedSectionLabels.title}
              description={purchasedSectionLabels.description}
              count={data.purchasedItems.length}
            >
              <ShoppingList
                items={data.purchasedItems}
                canManageItems={data.canManage}
                emptyTitle={purchasedSectionLabels.emptyTitle}
                emptyDescription={purchasedSectionLabels.emptyDescription}
              />
            </PageSection>
          </div>

          <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
            {data.canManage && <AddShoppingItemForm />}
          </aside>
        </div>
      </div>
    </PageContent>
  );
}
