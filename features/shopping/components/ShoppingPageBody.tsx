"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { ShoppingGroup } from "@/features/shopping/components/ShoppingGroup";
import type { FilterNavItem } from "@/shared/ui/FilterNav";
import { NewShoppingItemForm } from "@/features/shopping/components/forms/NewShoppingItemForm";
import {
  ShoppingToolbar,
  type ShoppingToolbarAction,
} from "@/features/shopping/components/ShoppingToolbar";
import { useComposerScroll } from "@/shared/hooks/useComposerScroll";
import type {
  ShoppingFilter,
  ShoppingPageData,
} from "@/features/shopping/types/shopping";

interface ShoppingPageBodyProps {
  activeFilter: ShoppingFilter;
  data: ShoppingPageData;
}

export function ShoppingPageBody({
  activeFilter,
  data,
}: ShoppingPageBodyProps) {
  const t = useTranslations("shopping");
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const composerRef = useComposerScroll(isComposerOpen);

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

  const primaryAction: ShoppingToolbarAction | undefined =
    activeFilter === "pending" && data.canManage && !isComposerOpen
      ? {
          label: t("form.openComposer"),
          onClick: () => setIsComposerOpen(true),
          icon: Plus,
        }
      : undefined;

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

  return (
    <div className="space-y-4">
      <section className="space-y-4">
        <ShoppingToolbar
          activeFilter={activeFilter}
          title={sectionConfig.title}
          description={sectionConfig.description}
          totalCount={sectionConfig.count}
          filterItems={filterItems}
          filterAriaLabel={t("aria.filterNavigation")}
          primaryAction={primaryAction}
        />

        {activeFilter === "pending" && data.canManage && isComposerOpen ? (
          <div ref={composerRef}>
            <NewShoppingItemForm onClose={() => setIsComposerOpen(false)} />
          </div>
        ) : null}
      </section>

      <ShoppingGroup
        label={sectionConfig.title}
        items={sectionConfig.items}
        emptyTitle={sectionConfig.emptyTitle}
        emptyDescription={sectionConfig.emptyDescription}
        canManageItems={data.canManage}
        view={sectionConfig.view}
      />
    </div>
  );
}
