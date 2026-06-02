import type { VisitStats, VisitStatus } from "../types/visits";

export function getVisitStatus(
  dateFrom: string,
  dateTo: string,
  today: string
): VisitStatus {
  if (dateTo < today) return "past";
  if (dateFrom > today) return "upcoming";
  return "current";
}

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
