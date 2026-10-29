import type { ShoppingFilter } from "@/features/shopping/types/shopping";
import { CollectionToolbar } from "@/shared/ui/CollectionToolbar";
import type { FilterNavItem } from "@/shared/ui/FilterNav";

interface ShoppingToolbarProps {
  activeFilter: ShoppingFilter;
  title: string;
  totalCount: number;
  filterItems: FilterNavItem<ShoppingFilter>[];
  filterAriaLabel: string;
}

export function ShoppingToolbar({
  activeFilter,
  title,
  totalCount,
  filterItems,
  filterAriaLabel,
}: ShoppingToolbarProps) {
  return (
    <CollectionToolbar
      activeFilter={activeFilter}
      title={title}
      totalCount={totalCount}
      filterItems={filterItems}
      filterAriaLabel={filterAriaLabel}
      filterPathname="/shopping"
    />
  );
}
