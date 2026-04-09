import { visitSchema } from "../schemas";
import { Visit } from "../types/visits";

export function mapDbVisitToDomain(dbVisit: {
  id: number;
  visitor_name: string;
  date_from: string;
  date_to: string;
  note: string | null;
  author: string;
  author_id: string;
  created_at: string;
}): Visit {
  const validated = visitSchema.parse({
    id: dbVisit.id,
    visitorName: dbVisit.visitor_name,
    dateFrom: dbVisit.date_from,
    dateTo: dbVisit.date_to,
    note: dbVisit.note,
    author: dbVisit.author,
    authorId: dbVisit.author_id,
    createdAt: dbVisit.created_at,
  });

  return validated as Visit;
}
