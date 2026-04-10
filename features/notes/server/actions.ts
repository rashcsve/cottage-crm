"use server";

import { getTranslations } from "next-intl/server";
import { createNoteSchema, DeleteNoteSchema } from "@/features/notes/schemas";
import { createNote, deleteNote } from "@/features/notes/server/mutations";
import type {
  CreateNoteResult,
  DeleteNoteResult,
} from "@/features/notes/types/actions";
import { requireAdmin } from "@/lib/auth/require-admin";
import { mapZodIssuesToFieldErrors } from "@/lib/utils/validation";
import { getCreateNoteSchemaMessages } from "@/features/notes/utils/get-create-note-schema-messages";
import { AuthError } from "@/lib/auth/errors";
import { revalidateNotePaths } from "@/features/notes/server/revalidation";

/**
 * Server action for creating a note.
 * Validates input, calls mutation, handles errors, and revalidates cache.
 *
 * @param data Form data to validate and create note
 * @returns CreateNoteResult with note ID or error details
 */
export async function addNoteAction(data: unknown): Promise<CreateNoteResult> {
  const t = await getTranslations("notes.form");
  const schema = createNoteSchema(getCreateNoteSchemaMessages(t));
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

    const result = await createNote(supabase, userId, displayName, parsed.data);

    if (!result.ok) {
      return {
        ok: false,
        error: t(`errors.${result.error}`),
      };
    }

    revalidateNotePaths();

    return {
      ok: true,
      data: result.data,
      message: t("success"),
    };
  } catch (error) {
    console.error("[addNoteAction] Unexpected error:", error);

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
 * Server action for deleting a note.
 * Only admins can delete notes.
 *
 * @param noteId ID of the note to delete
 * @returns DeleteNoteResult with success or error details
 */
export async function deleteNoteAction(
  input: unknown
): Promise<DeleteNoteResult> {
  const t = await getTranslations("notes.delete");
  const parsed = DeleteNoteSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      error: t("errors.invalidData"),
    };
  }

  try {
    const { supabase } = await requireAdmin();

    const result = await deleteNote(supabase, parsed.data.noteId);

    if (!result.ok) {
      return {
        ok: false,
        error: t(`errors.${result.error}`),
      };
    }

    revalidateNotePaths();

    return {
      ok: true,
      data: undefined,
      message: t("success"),
    };
  } catch (error) {
    console.error("[deleteNoteAction] Unexpected error:", error);

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
