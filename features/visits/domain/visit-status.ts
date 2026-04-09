/**
 * Pure logic: Determine visit status from date range.
 * NO strings, NO i18n, NO side effects.
 */

function parseDateOnly(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function getTodayOnly(): Date {
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth(), today.getDate());
}

export type VisitStatus = "past" | "upcoming" | "current";

/**
 * Calculate visit status based on date range.
 * Pure function: same input always produces same output.
 */
export function getVisitStatus(dateFrom: string, dateTo: string): VisitStatus {
  const todayOnly = getTodayOnly();
  const fromOnly = parseDateOnly(dateFrom);
  const toOnly = parseDateOnly(dateTo);

  if (toOnly < todayOnly) return "past";
  if (fromOnly > todayOnly) return "upcoming";
  return "current";
}

/**
 * Calculate visit stats from list.
 * Pure function for aggregation.
 */
export function calculateVisitStats(
  visits: Array<{ dateFrom: string; dateTo: string }>
): { upcoming: number; current: number; past: number } {
  return visits.reduce(
    (acc, visit) => {
      const status = getVisitStatus(visit.dateFrom, visit.dateTo);
      acc[status] += 1;
      return acc;
    },
    { upcoming: 0, current: 0, past: 0 }
  );
}
