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

const PENDING_HEADING_ID = "shopping-group-pending";
const PURCHASED_HEADING_ID = "shopping-group-purchased";

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
          headingId: PURCHASED_HEADING_ID,
          eyebrow: t("sections.purchased.eyebrow"),
          title: t("sections.purchased.title"),
          description: t("sections.purchased.description"),
          items: data.purchasedItems,
          emptyTitle: t("sections.purchased.emptyTitle"),
          emptyDescription: t("sections.purchased.emptyDescription"),
          tone: "success" as const,
          view: "purchased" as const,
        }
      : {
          headingId: PENDING_HEADING_ID,
          eyebrow: t("sections.pending.eyebrow"),
          title: t("sections.pending.title"),
          description: t("sections.pending.description"),
          items: data.pendingItems,
          emptyTitle: t("sections.pending.emptyTitle"),
          emptyDescription: t("sections.pending.emptyDescription"),
          tone: "neutral" as const,
          view: "pending" as const,
        };

  return (
    <div className="space-y-3.5 sm:space-y-4">
      <section className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
        <ShoppingToolbar
          activeFilter={activeFilter}
          eyebrow={t("summary.eyebrow")}
          title={t("summary.title")}
          description={t("summary.description")}
          totalCount={data.totalCount}
          filterItems={filterItems}
          filterAriaLabel={t("aria.filterNavigation")}
          primaryAction={primaryAction}
        />

        {activeFilter === "pending" && data.canManage && isComposerOpen ? (
          <div
            ref={composerRef}
            className="border-t border-stone-200 bg-stone-50 px-3 py-3.5 sm:px-4 sm:py-4"
          >
            <NewShoppingItemForm onClose={() => setIsComposerOpen(false)} />
          </div>
        ) : null}
      </section>

      <ShoppingGroup
        headingId={sectionConfig.headingId}
        eyebrow={sectionConfig.eyebrow}
        title={sectionConfig.title}
        description={sectionConfig.description}
        items={sectionConfig.items}
        emptyTitle={sectionConfig.emptyTitle}
        emptyDescription={sectionConfig.emptyDescription}
        canManageItems={data.canManage}
        tone={sectionConfig.tone}
        view={sectionConfig.view}
      />
    </div>
  );
}
