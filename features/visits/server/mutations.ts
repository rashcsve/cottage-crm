"use server";

import { SupabaseClient } from "@supabase/supabase-js";
import { mapDbVisitToDomain } from "./mappers";
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
      data: mapDbVisitToDomain(data, today),
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
    const { data: visit, error: fetchError } = await supabase
      .from("visits")
      .select("id, author_id")
      .eq("id", visitId)
      .single();

    if (fetchError || !visit) {
      console.error("[deleteVisit] Visit not found:", fetchError);
      return { ok: false, error: "notFound" };
    }

    const { error: deleteError } = await supabase
      .from("visits")
      .delete()
      .eq("id", visitId);

    if (deleteError) {
      console.error("[deleteVisit] DB error:", deleteError);
      return { ok: false, error: "databaseError" };
    }

    return { ok: true, data: undefined };
  } catch (error) {
    console.error("[deleteVisit] Unexpected error:", error);
    return { ok: false, error: "databaseError" };
  }
}
