import type { LucideIcon } from "lucide-react";

import { Button } from "@/shared/ui/Button";
import { FilterNav, type FilterNavItem } from "@/shared/ui/FilterNav";
import { SectionHeader } from "@/shared/ui/SectionHeader";
import { StatusBadge, type StatusBadgeTone } from "@/shared/ui/StatusBadge";

export interface CollectionToolbarSummaryItem {
  id: string;
  label: string;
  value: number;
  tone: StatusBadgeTone;
}

export interface CollectionToolbarAction {
  label: string;
  onClick: () => void;
  icon?: LucideIcon;
  ariaLabel?: string;
}

interface CollectionToolbarProps<TFilter extends string> {
  activeFilter: TFilter;
  eyebrow: string;
  title: string;
  description: string;
  totalCount: number;
  filterItems: FilterNavItem<TFilter>[];
  filterAriaLabel: string;
  filterPathname: string;
  primaryAction?: CollectionToolbarAction;
  summaryItems?: CollectionToolbarSummaryItem[];
  countTone?: StatusBadgeTone;
}

const SUMMARY_TONE_CLASS: Record<StatusBadgeTone, string> = {
  neutral: "border-stone-200 bg-stone-50 text-stone-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

export function CollectionToolbar<TFilter extends string>({
  activeFilter,
  eyebrow,
  title,
  description,
  totalCount,
  filterItems,
  filterAriaLabel,
  filterPathname,
  primaryAction,
  summaryItems = [],
  countTone = "neutral",
}: CollectionToolbarProps<TFilter>) {
  const PrimaryActionIcon = primaryAction?.icon;

  return (
    <header className="space-y-4 p-3.5 sm:p-4">
      <div className="space-y-3">
        <SectionHeader
          eyebrow={eyebrow}
          title={title}
          description={description}
          badge={
            <StatusBadge tone={countTone} className="tabular-nums">
              {totalCount}
            </StatusBadge>
          }
        />

        {summaryItems.length > 0 ? (
          <ul className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
            {summaryItems.map((item) => (
              <li
                key={item.id}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[13px] ${
                  SUMMARY_TONE_CLASS[item.tone]
                }`}
              >
                <span className="font-medium">{item.label}</span>
                <span className="tabular-nums">{item.value}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="flex min-w-0 items-center gap-2.5">
        <div className="min-w-0 flex-1">
          <FilterNav
            activeFilter={activeFilter}
            items={filterItems}
            ariaLabel={filterAriaLabel}
            pathname={filterPathname}
          />
        </div>

        {primaryAction ? (
          <Button
            type="button"
            onClick={primaryAction.onClick}
            aria-label={primaryAction.ariaLabel}
            className="min-h-10 w-10 shrink-0 gap-2 px-0 sm:w-auto sm:px-4"
          >
            {PrimaryActionIcon ? (
              <PrimaryActionIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
            ) : null}
            <span className="sr-only sm:not-sr-only">{primaryAction.label}</span>
          </Button>
        ) : null}
      </div>
    </header>
  );
}
