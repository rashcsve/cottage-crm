"use server";

import type { ZodIssue } from "zod";
import { getTranslations } from "next-intl/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { AuthError } from "@/lib/auth/errors";
import { mapAuthErrorMessage } from "@/lib/auth/map-auth-error";
import { toDateOnlyString } from "@/lib/utils/date";
import {
  createVisitSchema,
  DeleteVisitSchema,
  type CreateVisitFormData,
  type DeleteVisitInput,
} from "../schemas";
import { getCreateVisitSchemaMessages } from "../schemas/create-visit-schema-messages";
import type { CreateVisitResult, DeleteVisitResult } from "./action-types";
import { createVisit, deleteVisit } from "./mutations";
import { revalidateVisitPaths } from "./revalidation";

function mapVisitIssuesToFieldErrors(
  issues: ZodIssue[],
): Partial<Record<keyof CreateVisitFormData, string>> {
  return Object.fromEntries(
    issues.flatMap((issue) => {
      const fieldName = issue.path[0];

      if (typeof fieldName !== "string" || !issue.message) {
        return [];
      }

      return [[fieldName, issue.message]];
    }),
  );
}

export async function createVisitAction(
  input: CreateVisitFormData,
): Promise<CreateVisitResult> {
  const t = await getTranslations("visits.form");
  const schema = createVisitSchema(getCreateVisitSchemaMessages(t));
  const parsed = schema.safeParse(input);

  if (!parsed.success) {
    const fieldErrors = mapVisitIssuesToFieldErrors(parsed.error.issues);
    const hasDateRangeError =
      fieldErrors.dateTo === t("errors.dateFromAfterDateTo");

    return {
      ok: false,
      error: hasDateRangeError
        ? t("errors.dateRangeInvalid")
        : t("errors.invalidData"),
      fieldErrors,
    };
  }

  try {
    const { supabase, userId, displayName } = await requireAdmin();
    const today = toDateOnlyString(new Date());

    const result = await createVisit(
      supabase,
      userId,
      {
        visitorName: parsed.data.visitorName,
        dateFrom: parsed.data.dateFrom,
        dateTo: parsed.data.dateTo,
        note: parsed.data.note ?? null,
        author: displayName,
      },
      today,
    );

    if (!result.ok) {
      switch (result.error) {
        case "databaseError":
          return { ok: false, error: t("errors.databaseError") };
        default:
          return { ok: false, error: t("errors.unexpected") };
      }
    }

    revalidateVisitPaths();

    return { ok: true, data: result.data };
  } catch (error) {
    console.error("[createVisitAction] Unexpected error:", error);

    if (error instanceof AuthError) {
      return {
        ok: false,
        error: mapAuthErrorMessage(error.code, {
          notAuthenticated: t("errors.notAuthenticated"),
          profileNotFound: t("errors.profileNotFound"),
          forbidden: t("errors.forbidden"),
          unexpected: t("errors.unexpected"),
        }),
      };
    }

    return { ok: false, error: t("errors.unexpected") };
  }
}

export async function deleteVisitAction(
  input: DeleteVisitInput,
): Promise<DeleteVisitResult> {
  const t = await getTranslations("visits.delete");
  const parsed = DeleteVisitSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, error: t("errors.invalidData") };
  }

  try {
    const { supabase } = await requireAdmin();

    const result = await deleteVisit(supabase, parsed.data.visitId);

    if (!result.ok) {
      switch (result.error) {
        case "notFound":
          return { ok: false, error: t("errors.notFound") };
        case "databaseError":
          return { ok: false, error: t("errors.databaseError") };
        case "unauthorized":
          return { ok: false, error: t("errors.unauthorized") };
      }
    }

    revalidateVisitPaths();

    return { ok: true, data: undefined };
  } catch (error) {
    console.error("[deleteVisitAction] Unexpected error:", error);

    if (error instanceof AuthError) {
      return {
        ok: false,
        error: mapAuthErrorMessage(error.code, {
          notAuthenticated: t("errors.notAuthenticated"),
          profileNotFound: t("errors.profileNotFound"),
          forbidden: t("errors.forbidden"),
          unexpected: t("errors.unexpected"),
        }),
      };
    }

    return { ok: false, error: t("errors.unexpected") };
  }
}
