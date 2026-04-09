"use server";

import { createClient } from "@/lib/supabase/server";
import { mapDbVisitToDomain } from "./mappers";
import type { Visit } from "../types/visits";

/**
 * Fetch all visits using a server-provided reference date for derived status.
 */
export async function getVisits(today: string): Promise<Visit[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("visits")
      .select(
        "id, visitor_name, date_from, date_to, note, author, author_id, created_at"
      )
      .order("date_from", { ascending: true });

    if (error) {
      console.error("[getVisits] Query failed:", error);
      throw new Error("Failed to fetch visits");
    }

    return (data ?? []).map((visit) => mapDbVisitToDomain(visit, today));
  } catch (error) {
    console.error("[getVisits] Error:", error);
    throw error;
  }
}

/**
 * Fetch single visit by ID using a server-provided reference date.
 */
export async function getVisitById(
  id: number,
  today: string
): Promise<Visit | null> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("visits")
      .select(
        "id, visitor_name, date_from, date_to, note, author, author_id, created_at"
      )
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null; // not found
      console.error("[getVisitById] Query failed:", error);
      throw new Error("Failed to fetch visit");
    }

    return mapDbVisitToDomain(data, today);
  } catch (error) {
    console.error("[getVisitById] Error:", error);
    throw error;
  }
}
