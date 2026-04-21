import { z } from "zod";
import type { Visit } from "../types/visits";
import { getVisitStatus } from "../domain/visit-status";

const visitSchema = z.object({
  id: z.number().int().positive(),
  visitorName: z.string(),
  dateFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dateTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  status: z.enum(["past", "upcoming", "current"]),
  note: z.string().nullable(),
  author: z.string(),
  authorId: z.string(),
  createdAt: z.string(),
});

export interface VisitRow {
  id: number;
  visitor_name: string;
  date_from: string;
  date_to: string;
  note: string | null;
  author: string;
  author_id: string;
  created_at: string;
}

export function mapVisitRowToVisit(visitRow: VisitRow, today: string): Visit {
  const validated = visitSchema.parse({
    id: visitRow.id,
    visitorName: visitRow.visitor_name,
    dateFrom: visitRow.date_from,
    dateTo: visitRow.date_to,
    status: getVisitStatus(visitRow.date_from, visitRow.date_to, today),
    note: visitRow.note,
    author: visitRow.author,
    authorId: visitRow.author_id,
    createdAt: visitRow.created_at,
  });

  return validated;
}
