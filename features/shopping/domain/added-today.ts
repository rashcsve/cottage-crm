import { formatInTimeZone } from "date-fns-tz";
import type { ShoppingItem } from "@/features/shopping/types/shopping";

const TIME_ZONE = "Europe/Prague";
const DATE_ONLY_FORMAT = "yyyy-MM-dd";

function toPragueDateOnly(date: Date): string | null {
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return formatInTimeZone(date, TIME_ZONE, DATE_ONLY_FORMAT);
}

export function getShoppingTodayIso(now: Date): string {
  return formatInTimeZone(now, TIME_ZONE, DATE_ONLY_FORMAT);
}

export function countItemsAddedToday(
  items: ShoppingItem[],
  todayIso: string,
): number {
  return items.filter(
    (item) => toPragueDateOnly(new Date(item.createdAt)) === todayIso,
  ).length;
}
