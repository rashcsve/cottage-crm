import { addDaysUtc, formatDateOnlyUtc, parseDateOnlyUtc } from "@/lib/utils/date";

const FRIDAY = 5;
const SATURDAY = 6;

export function getDefaultVisitEnd(dateFrom: string): string {
  const start = parseDateOnlyUtc(dateFrom);
  const weekday = start.getUTCDay();

  if (weekday !== FRIDAY && weekday !== SATURDAY) {
    return dateFrom;
  }

  return formatDateOnlyUtc(addDaysUtc(start, 7 - weekday));
}
