import { Check, TriangleAlert } from "lucide-react";

import { FilterNav, type FilterNavItem } from "@/shared/ui/FilterNav";
import { SectionHeader } from "@/shared/ui/SectionHeader";
import { StatusLabel, type StatusLabelTone } from "@/shared/ui/StatusLabel";

interface CollectionToolbarProps<TFilter extends string> {
  activeFilter: TFilter;
  eyebrow?: string;
  title: string;
  titleId?: string;
  description?: string;
  totalCount: number;
  filterItems: FilterNavItem<TFilter>[];
  filterAriaLabel: string;
  filterPathname: string;
  countTone?: StatusLabelTone;
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
  titleId,
  description,
  totalCount,
  filterItems,
  filterAriaLabel,
  filterPathname,
  countTone = "neutral",
}: CollectionToolbarProps<TFilter>) {
  return (
    <header className="space-y-4 px-3.5 pb-3.5 sm:px-4 sm:pb-4">
      <SectionHeader
        eyebrow={eyebrow}
        title={title}
        titleId={titleId}
        description={description}
        badge={
          <span data-testid="collection-toolbar-total" className="inline-flex">
            <TotalCount value={totalCount} tone={countTone} />
          </span>
        }
      />

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
