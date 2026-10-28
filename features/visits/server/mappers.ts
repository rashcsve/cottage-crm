import { z } from "zod";
import type { Visit } from "../types/visits";
import type { Couple, CoupleId } from "../domain/couples";
import { getVisitStatus } from "../domain/visit-status";
import { CoupleIdSchema } from "../schemas";

const coupleSchema = z.object({
  id: CoupleIdSchema,
  label: z.string().trim().min(1),
});

export function mapCoupleRowToCouple(coupleRow: unknown): Couple | null {
  const parsed = coupleSchema.safeParse(coupleRow);

  return parsed.success ? parsed.data : null;
}

const profileCoupleSchema = z.object({
  couple: CoupleIdSchema,
});

export function mapProfileRowToCouple(profileRow: unknown): CoupleId | null {
  const parsed = profileCoupleSchema.safeParse(profileRow);

  return parsed.success ? parsed.data.couple : null;
}

const visitSchema = z.object({
  id: z.number().int().positive(),
  visitorName: z.string(),
  couple: CoupleIdSchema.nullable(),
  coupleLabel: z.string().nullable(),
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
  couple: string | null;
  couple_details?:
    | { label: string | null }
    | Array<{ label: string | null }>
    | null;
  date_from: string;
  date_to: string;
  note: string | null;
  author_id: string;
  created_at: string;
  author:
    | { display_name: string | null }
    | Array<{ display_name: string | null }>
    | null;
}

export function mapVisitRowToVisit(visitRow: VisitRow, today: string): Visit {
  const validated = visitSchema.parse({
    id: visitRow.id,
    visitorName: visitRow.visitor_name,
    couple: visitRow.couple,
    coupleLabel: extractCoupleLabel(visitRow.couple_details),
    dateFrom: visitRow.date_from,
    dateTo: visitRow.date_to,
    status: getVisitStatus(visitRow.date_from, visitRow.date_to, today),
    note: visitRow.note,
    author: extractAuthorDisplayName(visitRow.author),
    authorId: visitRow.author_id,
    createdAt: visitRow.created_at,
  });

  return validated;
}

function extractCoupleLabel(details: VisitRow["couple_details"]): string | null {
  const label = Array.isArray(details) ? details[0]?.label : details?.label;

  return label?.trim() || null;
}

// Supabase can return one-to-one relations as arrays depending on the query.
function extractAuthorDisplayName(author: VisitRow["author"]): string {
  const displayName = Array.isArray(author)
    ? author[0]?.display_name ?? null
    : author?.display_name ?? null;

  if (!displayName) {
    throw new Error("Invalid VisitRow: missing author display_name");
  }

  return displayName;
}
