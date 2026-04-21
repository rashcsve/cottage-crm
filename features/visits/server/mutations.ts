import "server-only";

import { SupabaseClient } from "@supabase/supabase-js";
import { mapVisitRowToVisit } from "./mappers";
import type { Visit } from "../types/visits";
import { MutationResult } from "@/lib/types/mutations.types";

/**
 * Insert a visit row and map the inserted record back into the visit domain model.
 * Authorization, translation, and revalidation are handled by the calling action.
 */
export async function createVisit(
  supabase: SupabaseClient,
  userId: string,
  input: {
    visitorName: string;
    dateFrom: string;
    dateTo: string;
    note: string | null;
    author: string;
  },
  today: string
): Promise<MutationResult<Visit>> {
  try {
    const { data, error } = await supabase
      .from("visits")
      .insert({
        visitor_name: input.visitorName,
        date_from: input.dateFrom,
        date_to: input.dateTo,
        note: input.note,
        author: input.author,
        author_id: userId,
      })
      .select(
        "id, visitor_name, date_from, date_to, note, author, author_id, created_at"
      )
      .single();

    if (error) {
      console.error("[createVisit] DB error:", error);
      return { ok: false, error: "databaseError" };
    }

    return {
      ok: true,
      data: mapVisitRowToVisit(data, today),
    };
  } catch (error) {
    console.error("[createVisit] Unexpected error:", error);
    return { ok: false, error: "databaseError" };
  }
}

/**
 * Mutation: Delete visit from DB.
 */
export async function deleteVisit(
  supabase: SupabaseClient,
  visitId: number
): Promise<MutationResult<void>> {
  try {
    const { data, error } = await supabase
      .from("visits")
      .delete()
      .eq("id", visitId)
      .select("id");

    if (error) {
      console.error("[deleteVisit] DB error:", error);
      return { ok: false, error: "databaseError" };
    }

    if (!data || data.length === 0) {
      return { ok: false, error: "notFound" };
    }

    return { ok: true, data: undefined };
  } catch (error) {
    console.error("[deleteVisit] Unexpected error:", error);
    return { ok: false, error: "databaseError" };
  }
}
