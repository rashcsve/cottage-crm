"use server";

import { getTranslations } from "next-intl/server";
import { createNoteSchema, DeleteNoteSchema } from "@/features/notes/schemas";
import {
  createNote,
  createNotePhotos,
  deleteNote,
  getNotePhotoStoragePaths,
} from "@/features/notes/server/mutations";
import type {
  CreateNoteResult,
  DeleteNoteResult,
} from "@/features/notes/types/actions";
import { requireAdmin } from "@/lib/auth/require-admin";
import { mapZodIssuesToFieldErrors } from "@/lib/utils/validation";
import { getCreateNoteSchemaMessages } from "@/features/notes/schemas/get-create-note-schema-messages";
import { AuthError } from "@/lib/auth/errors";
import { revalidateNotePaths } from "@/features/notes/server/revalidation";
import {
  removeNotePhotoObjects,
  uploadNotePhotos,
} from "@/features/notes/server/photo-storage";
import { validateNotePhotoFiles } from "@/features/notes/shared/notePhotoValidation";

function isFile(value: unknown): value is File {
  return (
    (typeof File !== "undefined" && value instanceof File) ||
    (typeof value === "object" &&
      value !== null &&
      "name" in value &&
      "size" in value &&
      "type" in value &&
      typeof (value as File).arrayBuffer === "function")
  );
}

function isFormData(value: unknown): value is FormData {
  return (
    (typeof FormData !== "undefined" && value instanceof FormData) ||
    (typeof value === "object" &&
      value !== null &&
      "get" in value &&
      "getAll" in value &&
      typeof (value as FormData).get === "function" &&
      typeof (value as FormData).getAll === "function")
  );
}

function getCreateNoteSubmission(data: unknown) {
  if (isFormData(data)) {
    return {
      content: data.get("content"),
      photos: data
        .getAll("photos")
        .filter((value): value is File => isFile(value) && value.size > 0),
    };
  }

  if (typeof data === "object" && data !== null) {
    const record = data as Record<string, unknown>;

    return {
      content: record.content,
      photos: Array.isArray(record.photos)
        ? record.photos.filter((value): value is File => isFile(value))
        : [],
    };
  }

  return {
    content: undefined,
    photos: [],
  };
}

async function rollbackCreatedNote(
  supabase: Awaited<ReturnType<typeof requireAdmin>>["supabase"],
  noteId: number,
  uploadedStoragePaths: string[]
) {
  await removeNotePhotoObjects(supabase, uploadedStoragePaths);
  await deleteNote(supabase, noteId);
}

export async function addNoteAction(data: unknown): Promise<CreateNoteResult> {
  const t = await getTranslations("notes.form");
  const schemaMessages = getCreateNoteSchemaMessages(t);
  const schema = createNoteSchema(schemaMessages);
  const submission = getCreateNoteSubmission(data);
  const photoValidationMessages = {
    tooMany: schemaMessages.photosTooMany,
    invalidType: schemaMessages.photoInvalidType,
    tooLarge: schemaMessages.photoTooLarge,
  };
  const parsed = schema.safeParse({
    content:
      typeof submission.content === "string" ? submission.content : submission.content ?? "",
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: t("errors.invalidData"),
      fieldErrors: mapZodIssuesToFieldErrors(parsed.error.issues, t),
    };
  }

  const photoValidationError = validateNotePhotoFiles(
    submission.photos,
    photoValidationMessages
  );

  if (photoValidationError) {
    return {
      ok: false,
      error: t("errors.invalidData"),
      fieldErrors: {
        photos: photoValidationError,
      },
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

    if (submission.photos.length > 0) {
      const uploadResult = await uploadNotePhotos(
        supabase,
        userId,
        result.data.id,
        submission.photos
      );

      if (!uploadResult.ok) {
        await rollbackCreatedNote(supabase, result.data.id, []);

        return {
          ok: false,
          error: t("errors.photoUploadFailed"),
        };
      }

      const createPhotosResult = await createNotePhotos(
        supabase,
        result.data.id,
        uploadResult.data
      );

      if (!createPhotosResult.ok) {
        await rollbackCreatedNote(
          supabase,
          result.data.id,
          uploadResult.data.map((photo) => photo.storagePath)
        );

        return {
          ok: false,
          error: t("errors.photoSaveFailed"),
        };
      }
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
    const notePhotosResult = await getNotePhotoStoragePaths(
      supabase,
      parsed.data.noteId
    );
    const storagePaths = notePhotosResult.ok ? notePhotosResult.data : [];

    const result = await deleteNote(supabase, parsed.data.noteId);

    if (!result.ok) {
      return {
        ok: false,
        error: t(`errors.${result.error}`),
      };
    }

    await removeNotePhotoObjects(supabase, storagePaths);

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
