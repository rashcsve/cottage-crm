"use server";

import { requireAdmin } from "@/lib/auth/require-admin";
import { ActionState } from "@/lib/types/action-state";
import { revalidatePath } from "next/cache";

interface VisitInput {
  visitorName: string;
  dateFrom: string;
  dateTo: string;
  note: string;
}

function getVisitInput(formData: FormData): VisitInput {
  return {
    visitorName: String(formData.get("visitorName") ?? "").trim(),
    dateFrom: String(formData.get("dateFrom") ?? "").trim(),
    dateTo: String(formData.get("dateTo") ?? "").trim(),
    note: String(formData.get("note") ?? "").trim(),
  };
}

function validateVisitInput({
  visitorName,
  dateFrom,
  dateTo,
}: VisitInput): ActionState | null {
  if (!visitorName) {
    return {
      ok: false,
      message: "Jméno návštěvníka je povinné.",
    };
  }

  if (!dateFrom || !dateTo) {
    return {
      ok: false,
      message: "Datum od i do je povinné.",
    };
  }

  if (dateFrom > dateTo) {
    return {
      ok: false,
      message: "Datum od nesmí být později než datum do.",
    };
  }

  return null;
}

export async function addVisitActions(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const input = getVisitInput(formData);
  const validationError = validateVisitInput(input);

  if (validationError) return validationError;

  try {
    const { supabase, userId, displayName } = await requireAdmin();

    const { error } = await supabase.from("visits").insert({
      visitor_name: input.visitorName,
      date_from: input.dateFrom,
      date_to: input.dateTo,
      note: input.note || null,
      author: displayName,
      author_id: userId,
    });

    if (error) return { ok: false, message: "Návštěvu se nepodařilo uložit." };

    revalidatePath("/visits");

    return {
      ok: true,
      message: "Návštěva byla přidána.",
    };
  } catch {
    return {
      ok: false,
      message: "Nastala chyba při ukládání návštěvy.",
    };
  }
}

export async function deleteVisitAction(visitId: number) {
  const { supabase } = await requireAdmin();

  const { error } = await supabase.from("visits").delete().eq("id", visitId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/visits");
}
