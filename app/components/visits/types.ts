export interface Visit {
  id: number;
  visitor_name: string;
  date_from: string;
  date_to: string;
  note: string | null;
  author: string;
  author_id: string;
  created_at: string;
}

export type VisitStatus = "past" | "upcoming" | "current";
