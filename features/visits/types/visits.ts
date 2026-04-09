export interface Visit {
  id: number;
  visitorName: string;
  dateFrom: string;
  dateTo: string;
  status: VisitStatus;
  note: string | null;
  author: string;
  authorId: string;
  createdAt: string;
}

export type VisitStatus = "past" | "upcoming" | "current";

export interface VisitStats {
  upcoming: number;
  current: number;
  past: number;
}

export interface VisitsPageData {
  visits: Visit[];
  stats: VisitStats;
  canManage: boolean;
}
