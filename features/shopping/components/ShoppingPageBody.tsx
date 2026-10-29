"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { ShoppingGroup } from "@/features/shopping/components/ShoppingGroup";
import type { FilterNavItem } from "@/shared/ui/FilterNav";
import { ShoppingToolbar } from "@/features/shopping/components/ShoppingToolbar";
import { deleteShoppingItemAction } from "@/features/shopping/server/actions";
import type {
  ShoppingFilter,
  ShoppingItem,
  ShoppingPageData,
} from "@/features/shopping/types/shopping";
import { useRouter } from "@/i18n/navigation";
import { useOptimisticRemoveList } from "@/shared/hooks/useOptimisticRemoveList";
import { QuickAddPlaceholder } from "@/shared/ui/Form/QuickAddPlaceholder";

const ShoppingQuickAdd = dynamic(
  () =>
    import("@/features/shopping/components/forms/ShoppingQuickAdd").then(
      (module) => module.ShoppingQuickAdd,
    ),
  {
    loading: () => (
      <QuickAddPlaceholder
        testId="shopping-quick-add-placeholder"
        className="py-3"
      />
    ),
  },
);

interface ShoppingPageBodyProps {
  activeFilter: ShoppingFilter;
  data: ShoppingPageData;
}

export function ShoppingPageBody({
  activeFilter,
  data,
}: ShoppingPageBodyProps) {
  const t = useTranslations("shopping");
  const tCommon = useTranslations("common");
  const router = useRouter();

  const allItems = useMemo(
    () => [...data.pendingItems, ...data.purchasedItems],
    [data.pendingItems, data.purchasedItems],
  );

  const { removeItem, isRemoved } = useOptimisticRemoveList({
    items: allItems,
    commitRemove: (item) => deleteShoppingItemAction({ itemId: item.id }),
    messages: {
      success: t("delete.success"),
      restored: t("delete.restored"),
      undo: t("delete.undo"),
      fallbackError: tCommon("error"),
      retry: t("delete.retry"),
    },
    onCommitSuccess: () => {
      router.refresh();
    },
  });

  const isVisible = (item: ShoppingItem) => !isRemoved(item.id);
  const pendingItems = data.pendingItems.filter(isVisible);
  const purchasedItems = data.purchasedItems.filter(isVisible);

  const filterItems: FilterNavItem<ShoppingFilter>[] = [
    {
      label: t("toolbar.filters.pending"),
      value: pendingItems.length,
      filter: "pending",
    },
    {
      label: t("toolbar.filters.purchased"),
      value: purchasedItems.length,
      filter: "purchased",
    },
  ];

  const sectionConfig =
    activeFilter === "purchased"
      ? {
          title: t("sections.purchased.title"),
          items: purchasedItems,
          emptyTitle: t("sections.purchased.emptyTitle"),
          emptyDescription: t("sections.purchased.emptyDescription"),
          view: "purchased" as const,
        }
      : {
          title: t("sections.pending.title"),
          items: pendingItems,
          emptyTitle: t("sections.pending.emptyTitle"),
          emptyDescription: t("sections.pending.emptyDescription"),
          view: "pending" as const,
        };

  const showQuickAdd = activeFilter === "pending" && data.canManage;

  return (
    <div className="space-y-2">
      <section className="space-y-4">
        <ShoppingToolbar
          activeFilter={activeFilter}
          title={sectionConfig.title}
          totalCount={sectionConfig.items.length}
          filterItems={filterItems}
          filterAriaLabel={t("aria.filterNavigation")}
        />
      </section>

      <ShoppingGroup
        label={sectionConfig.title}
        items={sectionConfig.items}
        onDelete={removeItem}
        emptyTitle={sectionConfig.emptyTitle}
        emptyDescription={sectionConfig.emptyDescription}
        canManageItems={data.canManage}
        view={sectionConfig.view}
        leadingRow={showQuickAdd ? <ShoppingQuickAdd /> : undefined}
      />
    </div>
  );
}
