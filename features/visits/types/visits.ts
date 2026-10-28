import type { Couple, CoupleId } from "../domain/couples";

export interface Visit {
  id: number;
  visitorName: string;
  couple: CoupleId | null;
  coupleLabel: string | null;
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
  canManage: boolean;
  todayIso: string;
  currentUserName: string;
  currentUserCouple: CoupleId | null;
  couples: Couple[];
}
