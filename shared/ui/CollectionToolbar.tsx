import { Check, TriangleAlert } from "lucide-react";

import { FilterNav, type FilterNavItem } from "@/shared/ui/FilterNav";
import { SectionHeader } from "@/shared/ui/SectionHeader";
import { StatusLabel, type StatusLabelTone } from "@/shared/ui/StatusLabel";

export interface CollectionToolbarSummaryItem {
  id: string;
  label: string;
  value: number;
  tone: StatusLabelTone;
}

interface CollectionToolbarProps<TFilter extends string> {
  activeFilter: TFilter;
  eyebrow?: string;
  title: string;
  description: string;
  totalCount: number;
  filterItems: FilterNavItem<TFilter>[];
  filterAriaLabel: string;
  filterPathname: string;
  summaryItems?: CollectionToolbarSummaryItem[];
  countTone?: StatusLabelTone;
}

const SEPARATOR_CLASS =
  "not-first:before:mr-2 not-first:before:text-ink-faint not-first:before:content-['·']";

function SummaryItemContent({ item }: { item: CollectionToolbarSummaryItem }) {
  const value = <span className="ml-1 font-mono tabular-nums">{item.value}</span>;

  switch (item.tone) {
    case "danger":
      return (
        <StatusLabel tone="danger" icon={TriangleAlert} className="gap-1">
          {item.label}{value}
        </StatusLabel>
      );
    case "warning":
      return (
        <StatusLabel tone="warning" icon={TriangleAlert} className="gap-1">
          {item.label}{value}
        </StatusLabel>
      );
    case "success":
      return (
        <StatusLabel tone="success" icon={Check} className="gap-1">
          {item.label}{value}
        </StatusLabel>
      );
    case "neutral":
      return (
        <span className="inline-flex items-center">
          <span>{item.label}</span>
          {value}
        </span>
      );
    default: {
      const exhaustive: never = item.tone;
      return exhaustive;
    }
  }
}

const TOTAL_COUNT_CLASS = "font-mono text-sm tabular-nums";

function TotalCount({ value, tone }: { value: number; tone: StatusLabelTone }) {
  switch (tone) {
    case "danger":
      return (
        <StatusLabel tone="danger" icon={TriangleAlert} className={TOTAL_COUNT_CLASS}>
          {value}
        </StatusLabel>
      );
    case "warning":
      return (
        <StatusLabel tone="warning" icon={TriangleAlert} className={TOTAL_COUNT_CLASS}>
          {value}
        </StatusLabel>
      );
    case "success":
      return (
        <StatusLabel tone="success" icon={Check} className={TOTAL_COUNT_CLASS}>
          {value}
        </StatusLabel>
      );
    case "neutral":
      return (
        <span className={`${TOTAL_COUNT_CLASS} text-ink-muted`}>{value}</span>
      );
    default: {
      const exhaustive: never = tone;
      return exhaustive;
    }
  }
}

export function CollectionToolbar<TFilter extends string>({
  activeFilter,
  eyebrow,
  title,
  description,
  totalCount,
  filterItems,
  filterAriaLabel,
  filterPathname,
  summaryItems = [],
  countTone = "neutral",
}: CollectionToolbarProps<TFilter>) {
  return (
    <header className="space-y-4 px-3.5 pb-3.5 sm:px-4 sm:pb-4">
      <div className="space-y-2">
        <SectionHeader
          eyebrow={eyebrow}
          title={title}
          description={description}
          badge={<TotalCount value={totalCount} tone={countTone} />}
        />

        {summaryItems.length > 0 ? (
          <ul className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ink-secondary">
            {summaryItems.map((item) => (
              <li
                key={item.id}
                className={`inline-flex items-center ${SEPARATOR_CLASS}`}
              >
                <SummaryItemContent item={item} />
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="flex min-w-0 flex-wrap items-end justify-between gap-x-4 gap-y-3">
        <div className="min-w-0 flex-auto">
          <FilterNav
            activeFilter={activeFilter}
            items={filterItems}
            ariaLabel={filterAriaLabel}
            pathname={filterPathname}
          />
        </div>
      </div>
    </header>
  );
}
