"use client";

import type { LucideIcon } from "lucide-react";
import {
  ShoppingFilterNav,
  type ShoppingFilterNavItem,
} from "@/features/shopping/components/ShoppingFilterNav";
import type { ShoppingFilter } from "@/features/shopping/types/shopping";
import { StatusBadge } from "@/shared/ui/StatusBadge";

interface ShoppingToolbarProps {
  activeFilter: ShoppingFilter;
  eyebrow: string;
  title: string;
  description: string;
  totalCount: number;
  filterItems: ShoppingFilterNavItem[];
  filterAriaLabel: string;
  primaryAction?: ShoppingToolbarAction;
}

export interface ShoppingToolbarSummaryItem {
  id: "pending" | "purchased";
  label: string;
  value: number;
  tone: "neutral" | "success";
}

export interface ShoppingToolbarAction {
  label: string;
  onClick: () => void;
  icon?: LucideIcon;
  ariaLabel?: string;
}

export function ShoppingToolbar({
  activeFilter,
  eyebrow,
  title,
  description,
  totalCount,
  filterItems,
  filterAriaLabel,
  primaryAction,
}: ShoppingToolbarProps) {
  const PrimaryActionIcon = primaryAction?.icon;

  return (
    <header className="space-y-4 p-3.5 sm:p-4">
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">
            {eyebrow}
          </p>

          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="text-lg font-semibold text-stone-900">{title}</h2>
            <StatusBadge tone="neutral" className="tabular-nums">
              {totalCount}
            </StatusBadge>
          </div>

          <p className="max-w-2xl text-sm text-stone-600">{description}</p>
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-2.5 sm:flex-row sm:items-center xl:justify-between">
        <div className="min-w-0 flex-1 sm:flex-none">
          <ShoppingFilterNav
            activeFilter={activeFilter}
            items={filterItems}
            ariaLabel={filterAriaLabel}
          />
        </div>

        {primaryAction ? (
          <div className="sm:flex-none">
            <button
              type="button"
              onClick={primaryAction.onClick}
              aria-label={primaryAction.ariaLabel}
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-stone-900 px-4 text-sm font-semibold text-white transition hover:bg-stone-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:ring-offset-2 sm:w-auto"
            >
              {PrimaryActionIcon ? (
                <PrimaryActionIcon className="h-4 w-4" aria-hidden="true" />
              ) : null}
              {primaryAction.label}
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
}
