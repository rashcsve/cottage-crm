"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { ImagePlus, Plus, X } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import {
  CreateNoteFormData,
  CreateNoteFormInput,
  createNoteSchema,
} from "@/features/notes/schemas";
import { getCreateNoteSchemaMessages } from "@/features/notes/utils/get-create-note-schema-messages";
import { addNoteAction } from "@/features/notes/server/actions";
import { useToast } from "@/shared/Toast/useToast";
import { FormMessage } from "@/shared/ui/FormMessage";
import { FieldGroup } from "@/shared/ui/FieldGroup";
import { FieldLabel } from "@/shared/ui/FieldLabel";
import { FieldError } from "@/shared/ui/Form/FieldError";
import { formInputClass } from "@/shared/ui/Form/formStyles";
import { useRouter } from "@/i18n/navigation";
import {
  NOTE_PHOTO_INPUT_ACCEPT,
  NOTE_PHOTO_MAX_COUNT,
  NOTE_PHOTO_MAX_SIZE_MB,
  validateNotePhotoFiles,
} from "@/features/notes/shared/notePhotoValidation";

const NEW_NOTE_FORM_ID = "new-note-form";
const NEW_NOTE_FORM_TITLE_ID = "new-note-form-title";
const NEW_NOTE_FILE_INPUT_ID = "new-note-photos";
const FORM_FIELDS = ["content", "photos"] as const;

type FormFieldName = (typeof FORM_FIELDS)[number];
type DraftNotePhoto = {
  file: File;
  id: string;
  previewUrl: string;
};

const defaultValues: CreateNoteFormInput = {
  content: "",
};

export function NewNoteForm() {
  const router = useRouter();
  const t = useTranslations("notes.form");
  const { error: showErrorToast, success: showSuccessToast } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<DraftNotePhoto[]>([]);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const [schema, photoValidationMessages] = useMemo(() => {
    const messages = getCreateNoteSchemaMessages(t);

    return [
      createNoteSchema(messages),
      {
        tooMany: messages.photosTooMany,
        invalidType: messages.photoInvalidType,
        tooLarge: messages.photoTooLarge,
      },
    ] as const;
  }, [t]);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError,
    clearErrors,
    setFocus,
  } = useForm<CreateNoteFormInput, undefined, CreateNoteFormData>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues,
  });

  const contentValue = useWatch({ control, name: "content" }) ?? "";

  function revokeDraftPhotos(photos: DraftNotePhoto[]) {
    for (const photo of photos) {
      URL.revokeObjectURL(photo.previewUrl);
    }
  }

  useEffect(() => {
    return () => {
      revokeDraftPhotos(selectedPhotos);
    };
  }, [selectedPhotos]);

  function openComposer() {
    clearErrors();
    setPhotoError(null);
    setIsExpanded(true);

    requestAnimationFrame(() => {
      setFocus("content");
    });
  }

  function closeComposer() {
    clearErrors();
    clearSelectedPhotos();
    reset(defaultValues);
    setPhotoError(null);
    setIsExpanded(false);
  }

  function applyFieldErrors(
    fieldErrors?: Partial<Record<FormFieldName, string | undefined>>
  ) {
    let firstInvalidField: FormFieldName | null = null;

    for (const fieldName of FORM_FIELDS) {
      const message = fieldErrors?.[fieldName];

      if (!message) {
        continue;
      }

      if (fieldName === "photos") {
        setPhotoError(message);
      } else {
        setError(fieldName, {
          type: "server",
          message,
        });
      }

      if (!firstInvalidField) {
        firstInvalidField = fieldName;
      }
    }

    return firstInvalidField;
  }

  function clearSelectedPhotos() {
    setSelectedPhotos([]);
  }

  function setDraftPhotos(nextFiles: File[]) {
    const nextDraftPhotos = nextFiles.map((file) => ({
      file,
      id: `${crypto.randomUUID()}-${file.name}`,
      previewUrl: URL.createObjectURL(file),
    }));

    setSelectedPhotos(nextDraftPhotos);
  }

  function validateAndSetDraftPhotos(nextFiles: File[]) {
    const validationError = validateNotePhotoFiles(
      nextFiles,
      photoValidationMessages
    );

    if (validationError) {
      setPhotoError(validationError);
      return false;
    }

    setPhotoError(null);
    setDraftPhotos(nextFiles);
    return true;
  }

  function handlePhotoSelection(event: ChangeEvent<HTMLInputElement>) {
    const nextFiles = [
      ...selectedPhotos.map((photo) => photo.file),
      ...Array.from(event.target.files ?? []),
    ];

    validateAndSetDraftPhotos(nextFiles);
    event.target.value = "";
  }

  function handleRemovePhoto(photoId: string) {
    const nextFiles = selectedPhotos
      .filter((photo) => photo.id !== photoId)
      .map((photo) => photo.file);

    validateAndSetDraftPhotos(nextFiles);
  }

  async function onSubmit(data: CreateNoteFormData) {
    clearErrors("root");

    if (photoError) {
      return;
    }

    const photoFiles = selectedPhotos.map((photo) => photo.file);
    const photoValidationError = validateNotePhotoFiles(
      photoFiles,
      photoValidationMessages
    );

    if (photoValidationError) {
      setPhotoError(photoValidationError);
      return;
    }

    try {
      setPhotoError(null);
      const formData = new FormData();
      formData.set("content", data.content);

      for (const file of photoFiles) {
        formData.append("photos", file);
      }

      const result = await addNoteAction(formData);

      if (result.ok) {
        const nextHref = result.data?.id
          ? `/notes#note-${result.data.id}`
          : "/notes";

        showSuccessToast(result.message ?? t("success"));
        reset(defaultValues);
        clearSelectedPhotos();
        setIsExpanded(false);
        router.refresh();
        router.replace(nextHref);
        return;
      }

      const errorMessage = result.error ?? t("error");
      const firstInvalidField = applyFieldErrors(result.fieldErrors);

      setIsExpanded(true);
      setError("root", {
        type: "server",
        message: errorMessage,
      });

      if (firstInvalidField === "content") {
        requestAnimationFrame(() => {
          setFocus(firstInvalidField);
        });
      }

      showErrorToast(errorMessage);
    } catch (error) {
      const message = error instanceof Error ? error.message : t("error");

      setIsExpanded(true);
      setError("root", {
        type: "server",
        message,
      });
      showErrorToast(message);
    }
  }

  if (!isExpanded) {
    return (
      <div className="flex justify-start sm:justify-end">
        <button
          type="button"
          aria-expanded={false}
          aria-controls={NEW_NOTE_FORM_ID}
          onClick={openComposer}
          className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-4 text-sm font-medium text-stone-700 transition hover:border-stone-300 hover:bg-stone-50 hover:text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:ring-offset-2"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          {t("openComposer")}
        </button>
      </div>
    );
  }

  return (
    <section
      id={NEW_NOTE_FORM_ID}
      aria-labelledby={NEW_NOTE_FORM_TITLE_ID}
      aria-busy={isSubmitting}
      className="rounded-2xl border border-stone-200 bg-stone-50 p-4"
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">
              {t("eyebrow")}
            </p>
            <h2
              id={NEW_NOTE_FORM_TITLE_ID}
              className="text-sm font-semibold text-stone-900"
            >
              {t("title")}
            </h2>
            <p className="max-w-2xl text-sm text-stone-600">
              {t("supportingCopy")}
            </p>
          </div>

          <button
            type="button"
            aria-expanded={true}
            aria-controls={NEW_NOTE_FORM_ID}
            onClick={closeComposer}
            className="inline-flex items-center gap-2 self-start rounded-xl px-2 py-1 text-sm font-medium text-stone-600 transition hover:bg-white hover:text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:ring-offset-2"
          >
            {t("closeComposer")}
          </button>
        </div>

        {errors.root?.message && (
          <FormMessage type="error" message={errors.root.message} />
        )}

        <FieldGroup>
          <div>
            <FieldLabel htmlFor="content">{t("fields.content")}</FieldLabel>
            <textarea
              id="content"
              placeholder={t("fields.contentPlaceholder")}
              disabled={isSubmitting}
              rows={5}
              maxLength={5000}
              aria-invalid={!!errors.content}
              aria-describedby={errors.content ? "content-error" : undefined}
              className={`${formInputClass(!!errors.content)} min-h-32 resize-y`}
              {...register("content")}
            />

            <div className="flex items-start justify-between gap-3">
              <FieldError id="content-error" message={errors.content?.message} />

              <p className="mt-1 shrink-0 text-xs text-stone-500">
                {t("characterCount", { count: contentValue.length })}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-dashed border-stone-200 bg-white/70 p-3.5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1">
                <FieldLabel htmlFor={NEW_NOTE_FILE_INPUT_ID}>
                  {t("fields.photos")}
                </FieldLabel>
                <p className="text-sm text-stone-600">
                  {t("fields.photosHint")}
                </p>
              </div>

              <label
                htmlFor={NEW_NOTE_FILE_INPUT_ID}
                className={`inline-flex items-center gap-2 self-start rounded-full border border-stone-200 bg-white px-3.5 py-2 text-sm font-medium shadow-sm transition ${
                  isSubmitting || selectedPhotos.length >= NOTE_PHOTO_MAX_COUNT
                    ? "cursor-not-allowed text-stone-400"
                    : "cursor-pointer text-stone-700 hover:border-stone-300 hover:bg-stone-50 hover:text-stone-900 focus-within:outline-none focus-within:ring-2 focus-within:ring-stone-900 focus-within:ring-offset-2"
                }`}
              >
                <ImagePlus className="h-4 w-4" aria-hidden="true" />
                <span>{t("fields.addPhotos")}</span>
              </label>
            </div>

            <input
              id={NEW_NOTE_FILE_INPUT_ID}
              type="file"
              accept={NOTE_PHOTO_INPUT_ACCEPT}
              multiple
              disabled={isSubmitting || selectedPhotos.length >= NOTE_PHOTO_MAX_COUNT}
              aria-describedby={
                photoError ? `${NEW_NOTE_FILE_INPUT_ID}-error` : undefined
              }
              className="sr-only"
              onChange={handlePhotoSelection}
            />

            <p className="mt-3 text-xs leading-5 text-stone-500">
              {t("fields.photoRequirements", {
                maxCount: NOTE_PHOTO_MAX_COUNT,
                maxSizeMb: NOTE_PHOTO_MAX_SIZE_MB,
              })}
            </p>

            {selectedPhotos.length > 0 ? (
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {selectedPhotos.map((photo, index) => (
                  <div
                    key={photo.id}
                    className="group relative overflow-hidden rounded-2xl border border-stone-200 bg-stone-100 shadow-sm"
                  >
                    {/* Local object urls are only used before submit for quick previews. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.previewUrl}
                      alt={t("fields.photoPreviewAlt", { index: index + 1 })}
                      className="aspect-[4/3] h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(photo.id)}
                      className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-stone-900/75 text-white transition hover:bg-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-stone-900"
                      aria-label={t("fields.removePhoto", {
                        index: index + 1,
                      })}
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                ))}
              </div>
            ) : null}

            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs font-medium text-stone-600">
                {t("fields.selectedPhotosCount", {
                  count: selectedPhotos.length,
                  maxCount: NOTE_PHOTO_MAX_COUNT,
                })}
              </p>

              <FieldError
                id={`${NEW_NOTE_FILE_INPUT_ID}-error`}
                message={photoError ?? undefined}
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-stone-200 pt-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-5 text-stone-500">
              {t("submitHint")}
            </p>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-stone-900 px-4 text-sm font-semibold text-white transition hover:bg-stone-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {isSubmitting ? t("submitting") : t("submit")}
            </button>
          </div>
        </FieldGroup>
      </form>
    </section>
  );
}
