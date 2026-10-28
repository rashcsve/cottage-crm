import "server-only";

import { createClient } from "@/lib/supabase/server";
import { mapCoupleRowToCouple, mapVisitRowToVisit } from "./mappers";
import type { Visit } from "../types/visits";
import { COUPLE_IDS, type Couple } from "../domain/couples";
import { VISIT_SELECT_COLUMNS } from "./visit-columns";

// Full collection fetch is intentional at current scale; add range queries if volume grows.
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

export async function getActiveAndUpcomingVisits(today: string): Promise<Visit[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("visits")
      .select(VISIT_SELECT_COLUMNS)
      .gte("date_to", today)
      .order("date_from", { ascending: true });

    if (error) {
      console.error("[getActiveAndUpcomingVisits] Query failed:", error);
      throw new Error("Failed to fetch visits");
    }

    return (data ?? []).map((visit) => mapVisitRowToVisit(visit, today));
  } catch (error) {
    console.error("[getActiveAndUpcomingVisits] Error:", error);
    throw error;
  }
}

export async function getCouples(): Promise<Couple[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("couples")
    .select("id, label");

  if (error) {
    console.error("[getCouples] Query failed:", error);
    throw new Error("Failed to fetch couples");
  }

  return (data ?? [])
    .map((row: unknown) => {
      const couple = mapCoupleRowToCouple(row);

      if (!couple) {
        console.error("[getCouples] Skipping invalid couple row:", row);
      }

      return couple;
    })
    .filter((couple): couple is Couple => couple !== null)
    .sort((a, b) => COUPLE_IDS.indexOf(a.id) - COUPLE_IDS.indexOf(b.id));
}
