"use server";

import { getTranslations } from "next-intl/server";
import { createShoppingItemSchema } from "@/features/shopping/schemas";
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
      error: t("error"),
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
        error: t("error"),
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
        error: t("error"),
      };
    }

    return {
      ok: false,
      error: error instanceof Error ? error.message : t("error"),
    };
  }
}

export async function toggleShoppingItemAction(
  itemId: number,
  isChecked: boolean
): Promise<UpdateShoppingItemResult> {
  const t = await getTranslations("shopping.toggle");

  try {
    const { supabase, userId, displayName } = await requireAdmin();

    const result = await updateShoppingItem(supabase, userId, displayName, {
      id: itemId,
      is_checked: !isChecked,
    });

    if (!result.ok) {
      return {
        ok: false,
        error: t("error"),
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
        error: t("error"),
      };
    }

    return {
      ok: false,
      error: error instanceof Error ? error.message : t("error"),
    };
  }
}

export async function deleteShoppingItemAction(
  itemId: number
): Promise<DeleteShoppingItemResult> {
  const t = await getTranslations("shopping.delete");

  try {
    const { supabase } = await requireAdmin();

    const result = await deleteShoppingItem(supabase, itemId);

    if (!result.ok) {
      return {
        ok: false,
        error: t("error"),
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
        error: t("error"),
      };
    }

    return {
      ok: false,
      error: error instanceof Error ? error.message : t("error"),
    };
  }
}
