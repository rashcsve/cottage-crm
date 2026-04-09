/**
 * Pure logic: Determine visit status from date range.
 * NO strings, NO i18n, NO side effects.
 */

export type VisitStatus = "past" | "upcoming" | "current";

/**
 * Calculate visit status based on date range.
 * Pure function: same input always produces same output.
 */
export function getVisitStatus(
  dateFrom: string,
  dateTo: string,
  today: string
): VisitStatus {
  if (dateTo < today) return "past";
  if (dateFrom > today) return "upcoming";
  return "current";
}

/**
 * Calculate visit stats from list.
 * Pure function for aggregation.
 */
export function calculateVisitStats(
  visits: Array<{ dateFrom: string; dateTo: string }>,
  today: string
): { upcoming: number; current: number; past: number } {
  return visits.reduce(
    (acc, visit) => {
      const status = getVisitStatus(visit.dateFrom, visit.dateTo, today);
      acc[status] += 1;
      return acc;
    },
    { upcoming: 0, current: 0, past: 0 }
  );
}
