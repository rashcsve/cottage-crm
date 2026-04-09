"use server";

import { createClient } from "@/lib/supabase/server";
import { mapDbVisitToDomain } from "./mappers";
import type { Visit } from "../types/visits";

/**
 * Fetch all visits.
 * Type-safe at boundary: validates DB response via mapper.
 */
export async function getVisits(): Promise<Visit[]> {
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

    return (data ?? []).map(mapDbVisitToDomain);
  } catch (error) {
    console.error("[getVisits] Error:", error);
    throw error;
  }
}

/**
 * Fetch single visit by ID.
 */
export async function getVisitById(id: number): Promise<Visit | null> {
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

    return mapDbVisitToDomain(data);
  } catch (error) {
    console.error("[getVisitById] Error:", error);
    throw error;
  }
}
