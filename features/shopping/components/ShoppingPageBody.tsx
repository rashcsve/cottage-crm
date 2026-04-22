"use client";

import { useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { ShoppingGroup } from "@/features/shopping/components/ShoppingGroup";
import type { ShoppingFilterNavItem } from "@/features/shopping/components/ShoppingFilterNav";
import { NewShoppingItemForm } from "@/features/shopping/components/forms/NewShoppingItemForm";
import {
  ShoppingToolbar,
  type ShoppingToolbarAction,
} from "@/features/shopping/components/ShoppingToolbar";
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
  const composerRef = useRef<HTMLDivElement>(null);
  const [isComposerOpen, setIsComposerOpen] = useState(false);

  useEffect(() => {
    if (!isComposerOpen) {
      return;
    }

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      "matchMedia" in window &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const frameId = requestAnimationFrame(() => {
      if (typeof composerRef.current?.scrollIntoView === "function") {
        composerRef.current.scrollIntoView({
          behavior: prefersReducedMotion ? "auto" : "smooth",
          block: "start",
        });
      }
    });

    return () => cancelAnimationFrame(frameId);
  }, [isComposerOpen]);

  const filterItems: ShoppingFilterNavItem[] = [
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
    <div className="space-y-4 sm:space-y-5">
      <section className="overflow-hidden rounded-4xl border border-stone-200 bg-white shadow-sm">
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
            className="border-t border-stone-200 bg-stone-50 px-3 py-4 sm:px-5 sm:py-5"
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
