"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { ShoppingGroup } from "@/features/shopping/components/ShoppingGroup";
import type { FilterNavItem } from "@/shared/ui/FilterNav";
import { ShoppingToolbar } from "@/features/shopping/components/ShoppingToolbar";
import type {
  ShoppingFilter,
  ShoppingPageData,
} from "@/features/shopping/types/shopping";

function ShoppingQuickAddPlaceholder() {
  return (
    <div
      aria-hidden="true"
      data-testid="shopping-quick-add-placeholder"
      className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-2 py-3"
    >
      <span className="mb-2 block text-sm font-semibold">&nbsp;</span>
      <div className="col-start-1 h-11 rounded-control border-control border-border bg-surface" />
      <div className="col-start-2 row-start-2 h-11 w-20 rounded-control bg-muted" />
    </div>
  );
}

const ShoppingQuickAdd = dynamic(
  () =>
    import("@/features/shopping/components/forms/ShoppingQuickAdd").then(
      (module) => module.ShoppingQuickAdd,
    ),
  { loading: ShoppingQuickAddPlaceholder },
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

  const filterItems: FilterNavItem<ShoppingFilter>[] = [
    {
      label: t("toolbar.filters.pending"),
      value: data.pendingCount,
      filter: "pending",
    },
    {
      label: t("toolbar.filters.purchased"),
      value: data.purchasedCount,
      filter: "purchased",
    },
  ];

  const sectionConfig =
    activeFilter === "purchased"
      ? {
          title: t("sections.purchased.title"),
          description: t("sections.purchased.description"),
          items: data.purchasedItems,
          count: data.purchasedCount,
          emptyTitle: t("sections.purchased.emptyTitle"),
          emptyDescription: t("sections.purchased.emptyDescription"),
          view: "purchased" as const,
        }
      : {
          title: t("sections.pending.title"),
          description: t("sections.pending.description"),
          items: data.pendingItems,
          count: data.pendingCount,
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
          description={sectionConfig.description}
          totalCount={sectionConfig.count}
          filterItems={filterItems}
          filterAriaLabel={t("aria.filterNavigation")}
        />
      </section>

      <ShoppingGroup
        label={sectionConfig.title}
        items={sectionConfig.items}
        emptyTitle={sectionConfig.emptyTitle}
        emptyDescription={sectionConfig.emptyDescription}
        canManageItems={data.canManage}
        view={sectionConfig.view}
        leadingRow={showQuickAdd ? <ShoppingQuickAdd /> : undefined}
      />
    </div>
  );
}
