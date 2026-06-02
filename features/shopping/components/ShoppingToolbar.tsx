import type { ShoppingFilter } from "@/features/shopping/types/shopping";
import {
  CollectionToolbar,
  type CollectionToolbarAction as SharedShoppingToolbarAction,
} from "@/shared/ui/CollectionToolbar";
import type { FilterNavItem } from "@/shared/ui/FilterNav";

interface ShoppingToolbarProps {
  activeFilter: ShoppingFilter;
  eyebrow: string;
  title: string;
  description: string;
  totalCount: number;
  filterItems: FilterNavItem<ShoppingFilter>[];
  filterAriaLabel: string;
  primaryAction?: ShoppingToolbarAction;
}

export type ShoppingToolbarAction = SharedShoppingToolbarAction;

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
  return (
    <CollectionToolbar
      activeFilter={activeFilter}
      eyebrow={eyebrow}
      title={title}
      description={description}
      totalCount={totalCount}
      filterItems={filterItems}
      filterAriaLabel={filterAriaLabel}
      filterPathname="/shopping"
      primaryAction={primaryAction}
    />
  );
}
