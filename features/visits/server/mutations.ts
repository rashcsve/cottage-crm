import "server-only";

import { SupabaseClient } from "@supabase/supabase-js";
import { mapVisitRowToVisit } from "./mappers";
import { VISIT_SELECT_COLUMNS } from "./visit-columns";
import type { Visit } from "../types/visits";
import type { CoupleId } from "../domain/couples";
import { MutationResult } from "@/lib/types/mutations.types";

const EXCLUSION_VIOLATION = "23P01";

// Authorization, translation, and revalidation are the caller's responsibility.
export async function createVisit(
  supabase: SupabaseClient,
  userId: string,
  input: {
    visitorName: string;
    couple: CoupleId;
    dateFrom: string;
    dateTo: string;
    note: string | null;
  },
  today: string
): Promise<MutationResult<Visit>> {
  try {
    const { data, error } = await supabase
      .from("visits")
      .insert({
        visitor_name: input.visitorName,
        couple: input.couple,
        date_from: input.dateFrom,
        date_to: input.dateTo,
        note: input.note,
        author_id: userId,
      })
      .select(VISIT_SELECT_COLUMNS)
      .single();

    if (error?.code === EXCLUSION_VIOLATION) {
      return { ok: false, error: "conflict" };
    }

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
