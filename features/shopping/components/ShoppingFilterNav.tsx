import type { ShoppingFilter } from "@/features/shopping/types/shopping";
import { FilterNav, type FilterNavItem as SharedFilterNavItem } from "@/shared/ui/FilterNav";

export type ShoppingFilterNavItem = SharedFilterNavItem<ShoppingFilter>;

interface ShoppingFilterNavProps {
  activeFilter: ShoppingFilter;
  items: ShoppingFilterNavItem[];
  ariaLabel: string;
}

export function ShoppingFilterNav({
  activeFilter,
  items,
  ariaLabel,
}: ShoppingFilterNavProps) {
  return (
    <FilterNav
      activeFilter={activeFilter}
      items={items}
      ariaLabel={ariaLabel}
      pathname="/shopping"
    />
  );
}
