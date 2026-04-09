"use server";

import { SupabaseClient } from "@supabase/supabase-js";
import { mapDbVisitToDomain } from "./mappers";
import type { Visit } from "../types/visits";
import { MutationResult } from "@/lib/types/mutations.types";

/**
 * Mutation: Create visit in DB.
 * Pure database operation - no auth, no i18n, no side effects.
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
  }
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
      data: mapDbVisitToDomain(data),
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
    // Verify the visit exists
    const { data: visit, error: fetchError } = await supabase
      .from("visits")
      .select("id, author_id")
      .eq("id", visitId)
      .single();

    if (fetchError || !visit) {
      console.error("[deleteVisit] Visit not found:", fetchError);
      return { ok: false, error: "notFound" };
    }

    // Delete the visit
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
