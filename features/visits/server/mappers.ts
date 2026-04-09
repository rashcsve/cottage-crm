import { visitSchema } from "../schemas";
import type { Visit } from "../types/visits";
import { getVisitStatus } from "../domain/visit-status";

export function mapDbVisitToDomain(dbVisit: {
  id: number;
  visitor_name: string;
  date_from: string;
  date_to: string;
  note: string | null;
  author: string;
  author_id: string;
  created_at: string;
}, today: string): Visit {
  const validated = visitSchema.parse({
    id: dbVisit.id,
    visitorName: dbVisit.visitor_name,
    dateFrom: dbVisit.date_from,
    dateTo: dbVisit.date_to,
    status: getVisitStatus(dbVisit.date_from, dbVisit.date_to, today),
    note: dbVisit.note,
    author: dbVisit.author,
    authorId: dbVisit.author_id,
    createdAt: dbVisit.created_at,
  });

  return validated;
}
