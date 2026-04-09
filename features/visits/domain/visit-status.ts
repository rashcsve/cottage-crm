import type { VisitStats, VisitStatus } from "../types/visits";

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
  visits: Array<{ status: VisitStatus }>
): VisitStats {
  return visits.reduce(
    (acc, visit) => {
      acc[visit.status] += 1;
      return acc;
    },
    { upcoming: 0, current: 0, past: 0 }
  );
}
