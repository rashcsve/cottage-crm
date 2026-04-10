"use server";

import { getTranslations } from "next-intl/server";
import {
  createShoppingItemSchema,
  DeleteShoppingItemSchema,
  ToggleShoppingItemSchema,
} from "@/features/shopping/schemas";
import {
  createShoppingItem,
  updateShoppingItem,
  deleteShoppingItem,
} from "./mutations";
import type {
  CreateShoppingItemResult,
  UpdateShoppingItemResult,
  DeleteShoppingItemResult,
} from "../types/actions";
import { requireAdmin } from "@/lib/auth/require-admin";
import { mapZodIssuesToFieldErrors } from "@/lib/utils/validation";
import { getShoppingSchemaMessages } from "../utils/get-shopping-schema-messages";
import { AuthError } from "@/lib/auth/errors";
import { revalidateShoppingPaths } from "./revalidation";

export async function addShoppingItemAction(
  data: unknown
): Promise<CreateShoppingItemResult> {
  const t = await getTranslations("shopping.form");
  const schema = createShoppingItemSchema(getShoppingSchemaMessages(t));
  const parsed = schema.safeParse(data);

  if (!parsed.success) {
    return {
      ok: false,
      error: t("errors.invalidData"),
      fieldErrors: mapZodIssuesToFieldErrors(parsed.error.issues, t),
    };
  }

  try {
    const { supabase, userId, displayName } = await requireAdmin();

    const result = await createShoppingItem(
      supabase,
      userId,
      displayName,
      parsed.data
    );

    if (!result.ok) {
      return {
        ok: false,
        error: t(`errors.${result.error}`),
      };
    }

    revalidateShoppingPaths();

    return {
      ok: true,
      data: result.data,
      message: t("success"),
    };
  } catch (error) {
    console.error("[addShoppingItemAction] Unexpected error:", error);

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

export async function toggleShoppingItemAction(
  input: unknown
): Promise<UpdateShoppingItemResult> {
  const t = await getTranslations("shopping.toggle");
  const parsed = ToggleShoppingItemSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      error: t("errors.invalidData"),
    };
  }

  try {
    const { supabase, userId, displayName } = await requireAdmin();

    const result = await updateShoppingItem(supabase, userId, displayName, {
      id: parsed.data.itemId,
      isChecked: !parsed.data.isChecked,
    });

    if (!result.ok) {
      return {
        ok: false,
        error: t(`errors.${result.error}`),
      };
    }

    revalidateShoppingPaths();

    return {
      ok: true,
      data: undefined,
      message: t("success"),
    };
  } catch (error) {
    console.error("[toggleShoppingItemAction] Unexpected error:", error);

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

export async function deleteShoppingItemAction(
  input: unknown
): Promise<DeleteShoppingItemResult> {
  const t = await getTranslations("shopping.delete");
  const parsed = DeleteShoppingItemSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      error: t("errors.invalidData"),
    };
  }

  try {
    const { supabase } = await requireAdmin();

    const result = await deleteShoppingItem(supabase, parsed.data.itemId);

    if (!result.ok) {
      return {
        ok: false,
        error: t(`errors.${result.error}`),
      };
    }

    revalidateShoppingPaths();

    return {
      ok: true,
      data: undefined,
      message: t("success"),
    };
  } catch (error) {
    console.error("[deleteShoppingItemAction] Unexpected error:", error);

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
