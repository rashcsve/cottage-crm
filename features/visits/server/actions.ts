"use server";

import { getTranslations } from "next-intl/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { AuthError } from "@/lib/auth/errors";
import { mapZodIssuesToFieldErrors } from "@/lib/utils/validation";
import { toDateOnlyString } from "@/lib/utils/date";
import {
  createVisitSchema,
  DeleteVisitSchema,
  type CreateVisitFormData,
  type DeleteVisitInput,
} from "../schemas";
import type { CreateVisitResult, DeleteVisitResult } from "../types/actions";
import { getCreateVisitSchemaMessages } from "../utils/get-create-visit-schema-messages";
import { createVisit, deleteVisit } from "./mutations";
import { revalidateVisitPaths } from "./revalidation";

/**
 * Server action: Create visit with full error handling and i18n.
 * Mirrors tasks pattern exactly.
 */
export async function createVisitAction(
  input: CreateVisitFormData
): Promise<CreateVisitResult> {
  const t = await getTranslations("visits.form");
  const schema = createVisitSchema(getCreateVisitSchemaMessages(t));
  const parsed = schema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      error: t("errors.invalidData"),
      fieldErrors: mapZodIssuesToFieldErrors(parsed.error.issues, t),
    };
  }

  if (parsed.data.dateFrom > parsed.data.dateTo) {
    return {
      ok: false,
      error: t("errors.dateRangeInvalid"),
      fieldErrors: { dateTo: t("errors.dateFromAfterDateTo") },
    };
  }

  try {
    const { supabase, userId, displayName } = await requireAdmin();
    const today = toDateOnlyString(new Date());

    const result = await createVisit(supabase, userId, {
      visitorName: parsed.data.visitorName,
      dateFrom: parsed.data.dateFrom,
      dateTo: parsed.data.dateTo,
      note: parsed.data.note ?? null,
      author: displayName,
    }, today);

    if (!result.ok) {
      return { ok: false, error: t(`errors.${result.error}`) };
    }

    revalidateVisitPaths();

    return {
      ok: true,
      data: result.data,
    };
  } catch (error) {
    console.error("[createVisitAction] Unexpected error:", error);

    if (error instanceof AuthError) {
      return {
        ok: false,
        error: t(`errors.${error.code}`),
      };
    }

    return {
      ok: false,
      error: t("errors.unexpected"),
    };
  }
}

/**
 * Server action: Delete visit.
 */
export async function deleteVisitAction(
  input: DeleteVisitInput
): Promise<DeleteVisitResult> {
  const t = await getTranslations("visits.delete");
  const parsed = DeleteVisitSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      error: t("errors.invalidData"),
    };
  }

  try {
    const { supabase } = await requireAdmin();

    const result = await deleteVisit(supabase, parsed.data.visitId);

    if (!result.ok) {
      return { ok: false, error: t(`errors.${result.error}`) };
    }

    revalidateVisitPaths();

    return { ok: true, data: undefined };
  } catch (error) {
    console.error("[deleteVisitAction] Unexpected error:", error);

    if (error instanceof AuthError) {
      return {
        ok: false,
        error: t(`errors.${error.code}`),
      };
    }

    return {
      ok: false,
      error: t("errors.unexpected"),
    };
  }
}
