import "server-only";

import { createClient } from "@/lib/supabase/server";
import { mapVisitRowToVisit } from "./mappers";
import type { Visit } from "../types/visits";

const VISIT_SELECT_COLUMNS =
  "id, visitor_name, date_from, date_to, note, author, author_id, created_at";

/**
 * Fetch the full visits collection used by the current calendar page.
 * This is intentional for the current product scope; revisit if visit volume
 * grows enough that range/window queries become necessary.
 */
export async function getAllVisits(today: string): Promise<Visit[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("visits")
      .select(VISIT_SELECT_COLUMNS)
      .order("date_from", { ascending: true });

    if (error) {
      console.error("[getAllVisits] Query failed:", error);
      throw new Error("Failed to fetch visits");
    }

    return (data ?? []).map((visit) => mapVisitRowToVisit(visit, today));
  } catch (error) {
    console.error("[getAllVisits] Error:", error);
    throw error;
  }
}
