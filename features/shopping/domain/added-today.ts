import type { ShoppingItem } from "@/features/shopping/types/shopping";
import { formatPragueDateOnly, toPragueDateOnly } from "@/lib/utils/date";

export function getShoppingTodayIso(now: Date): string {
  return formatPragueDateOnly(now);
}

export function countItemsAddedToday(
  items: ShoppingItem[],
  todayIso: string,
): number {
  return items.filter(
    (item) => toPragueDateOnly(new Date(item.createdAt)) === todayIso,
  ).length;
}
