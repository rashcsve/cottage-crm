"use client";

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import {
  CreateNoteFormData,
  CreateNoteFormInput,
  createNoteSchema,
} from "@/features/notes/schemas";
import { getCreateNoteSchemaMessages } from "@/features/notes/schemas/get-create-note-schema-messages";
import { addNoteAction } from "@/features/notes/server/actions";
import { useToast } from "@/shared/Toast/useToast";
import { TextAreaField } from "@/shared/ui/Form/Field";
import { FormMessage } from "@/shared/ui/FormMessage";
import { FieldGroup } from "@/shared/ui/FieldGroup";
import { FieldLabel } from "@/shared/ui/FieldLabel";
import { FieldError } from "@/shared/ui/Form/FieldError";
import { FieldHint } from "@/shared/ui/Form/FieldHint";

import {
  isAcceptedNotePhotoType,
  NOTE_PHOTO_INPUT_ACCEPT,
  NOTE_PHOTO_MAX_COUNT,
  NOTE_PHOTO_MAX_SIZE_BYTES,
  validateNotePhotoFiles,
} from "@/features/notes/shared/notePhotoValidation";
import { downscaleNotePhoto } from "@/features/notes/shared/downscaleNotePhoto";
import { useAutoFocus } from "@/shared/hooks/useAutoFocus";
import { applyFieldErrors } from "@/shared/ui/Form/applyFieldErrors";
import { AddItemPanelFooter } from "@/shared/ui/AddItemPanel";
import { Button, buttonVariants } from "@/shared/ui/Button";
import { IconButton } from "@/shared/ui/IconButton";

const NEW_NOTE_FORM_ID = "new-note-form";
const NEW_NOTE_FILE_INPUT_ID = "new-note-photos";
const NEW_NOTE_PHOTO_HINT_ID = `${NEW_NOTE_FILE_INPUT_ID}-hint`;
const NEW_NOTE_PHOTO_ERROR_ID = `${NEW_NOTE_FILE_INPUT_ID}-error`;
const FORM_FIELDS = ["content", "photos"] as const;
const NOTE_PHOTO_DOWNSCALE_OPTIONS = {
  maxEdgePx: 2048,
  quality: 0.82,
  maxBytes: NOTE_PHOTO_MAX_SIZE_BYTES,
  retryQuality: 0.7,
};

async function prepareNotePhoto(file: File): Promise<File> {
  if (!isAcceptedNotePhotoType(file.type)) {
    return file;
  }

  try {
    return await downscaleNotePhoto(file, NOTE_PHOTO_DOWNSCALE_OPTIONS);
  } catch {
    return file;
  }
}

type DraftNotePhoto = {
  file: File;
  id: string;
  previewUrl: string;
};

const defaultValues: CreateNoteFormInput = {
  content: "",
};

interface NewNoteFormProps {
  onClose: () => void;
  onDirtyChange: (isDirty: boolean) => void;
}

export function NewNoteForm({ onClose, onDirtyChange }: NewNoteFormProps) {
  const t = useTranslations("notes.form");
  const { success: showSuccessToast } = useToast();
  const [selectedPhotos, setSelectedPhotos] = useState<DraftNotePhoto[]>([]);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [isProcessingPhotos, setIsProcessingPhotos] = useState(false);
  const draftPhotosRef = useRef<DraftNotePhoto[]>([]);
  const isMountedRef = useRef(false);

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
    formState: { errors, isSubmitting, isDirty },
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
  const isBusy = isSubmitting || isProcessingPhotos;
  const isPhotoInputDisabled =
    isBusy || selectedPhotos.length >= NOTE_PHOTO_MAX_COUNT;

  const hasUnsavedInput = isDirty || selectedPhotos.length > 0;

  useEffect(() => {
    onDirtyChange(hasUnsavedInput);
  }, [hasUnsavedInput, onDirtyChange]);

  useEffect(() => {
    draftPhotosRef.current = selectedPhotos;
  }, [selectedPhotos]);

  useEffect(() => {
    const ref = draftPhotosRef;
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      for (const photo of ref.current) {
        URL.revokeObjectURL(photo.previewUrl);
      }
    };
  }, []);

  useAutoFocus(setFocus, "content");

  function setDraftPhotos(nextFiles: File[]) {
    const byFile = new Map(selectedPhotos.map((p) => [p.file, p]));
    const nextSet = new Set(nextFiles);

    for (const photo of selectedPhotos) {
      if (!nextSet.has(photo.file)) {
        URL.revokeObjectURL(photo.previewUrl);
      }
    }

    const next = nextFiles.map(
      (file) =>
        byFile.get(file) ?? {
          file,
          id: `${crypto.randomUUID()}-${file.name}`,
          previewUrl: URL.createObjectURL(file),
        },
    );

    setSelectedPhotos(next);
  }

  function clearSelectedPhotos() {
    setDraftPhotos([]);
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

  async function handlePhotoSelection(event: ChangeEvent<HTMLInputElement>) {
    const currentFiles = selectedPhotos.map((photo) => photo.file);
    const pickedFiles = Array.from(event.target.files ?? []);
    event.target.value = "";

    if (currentFiles.length + pickedFiles.length > NOTE_PHOTO_MAX_COUNT) {
      validateAndSetDraftPhotos([...currentFiles, ...pickedFiles]);
      return;
    }

    setIsProcessingPhotos(true);
    const preparedFiles: File[] = [];

    try {
      for (const file of pickedFiles) {
        preparedFiles.push(await prepareNotePhoto(file));
      }
    } finally {
      setIsProcessingPhotos(false);
    }

    if (!isMountedRef.current) {
      return;
    }

    validateAndSetDraftPhotos([...currentFiles, ...preparedFiles]);
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
        showSuccessToast(result.message ?? t("success"));
        reset(defaultValues);
        clearSelectedPhotos();
        onClose();
        return;
      }

      const errorMessage = result.error ?? t("error");
      const firstInvalidField = applyFieldErrors(
        FORM_FIELDS,
        result.fieldErrors,
        (name, message) => {
          if (name === "photos") {
            setPhotoError(message);
          } else {
            setError(name, { type: "server", message });
          }
        },
      );

      setError("root", {
        type: "server",
        message: errorMessage,
      });

      if (firstInvalidField === "content") {
        requestAnimationFrame(() => {
          setFocus(firstInvalidField);
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : t("error");

      setError("root", {
        type: "server",
        message,
      });
    }
  }

  return (
    <form
      id={NEW_NOTE_FORM_ID}
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      aria-busy={isBusy}
      className="space-y-4"
    >
      <p className="text-sm text-ink-secondary">{t("supportingCopy")}</p>

      {errors.root?.message && (
        <FormMessage type="error" message={errors.root.message} />
      )}

      <FieldGroup>
        <TextAreaField
          id="content"
          placeholder={t("fields.contentPlaceholder")}
          disabled={isSubmitting}
          required
          rows={5}
          maxLength={5000}
          label={t("fields.content")}
          error={errors.content?.message}
          className="min-h-32 resize-y"
          footer={
            <p className="font-mono text-xs text-ink-muted">
              {t("characterCount", { count: contentValue.length })}
            </p>
          }
          {...register("content")}
        />

        <div>
          <FieldLabel htmlFor={NEW_NOTE_FILE_INPUT_ID}>
            {t("fields.photos")}
          </FieldLabel>
          <FieldHint
            id={NEW_NOTE_PHOTO_HINT_ID}
            message={t("fields.photoRequirements", {
              maxCount: NOTE_PHOTO_MAX_COUNT,
            })}
          />

          <input
            id={NEW_NOTE_FILE_INPUT_ID}
            type="file"
            accept={NOTE_PHOTO_INPUT_ACCEPT}
            multiple
            disabled={isPhotoInputDisabled}
            aria-describedby={
              photoError
                ? `${NEW_NOTE_PHOTO_HINT_ID} ${NEW_NOTE_PHOTO_ERROR_ID}`
                : NEW_NOTE_PHOTO_HINT_ID
            }
            className="sr-only"
            onChange={handlePhotoSelection}
          />

          <div className="mt-3 flex items-center gap-3">
            <label
              htmlFor={NEW_NOTE_FILE_INPUT_ID}
              className={buttonVariants(
                "secondary",
                `shrink-0 whitespace-nowrap has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent ${
                  isPhotoInputDisabled
                    ? "cursor-not-allowed opacity-50"
                    : "cursor-pointer"
                }`,
              )}
            >
              <ImagePlus className="size-4" aria-hidden="true" />
              <span>{t("fields.addPhotos")}</span>
            </label>

            {selectedPhotos.length > 0 ? (
              <p className="font-mono text-xs text-ink-muted">
                {t("fields.selectedPhotosCount", {
                  count: selectedPhotos.length,
                  maxCount: NOTE_PHOTO_MAX_COUNT,
                })}
              </p>
            ) : null}
          </div>

          <p role="status" className="sr-only">
            {isProcessingPhotos ? t("processingPhotos") : null}
          </p>

          <FieldError id={NEW_NOTE_PHOTO_ERROR_ID} message={photoError ?? undefined} />

          {selectedPhotos.length > 0 ? (
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {selectedPhotos.map((photo, index) => (
                <div
                  key={photo.id}
                  className="relative overflow-hidden rounded-control bg-muted"
                >
                  {/* Local object urls are only used before submit for quick previews. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.previewUrl}
                    alt={t("fields.photoPreviewAlt", { index: index + 1 })}
                    className="aspect-4/3 h-full w-full object-cover"
                  />
                  <IconButton
                    type="button"
                    onClick={() => handleRemovePhoto(photo.id)}
                    disabled={isBusy}
                    className="absolute right-1 top-1 bg-ink-primary/80 text-on-accent hover:bg-ink-primary hover:text-on-accent"
                    aria-label={t("fields.removePhoto", {
                      index: index + 1,
                    })}
                  >
                    <X aria-hidden="true" />
                  </IconButton>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <AddItemPanelFooter>
          <Button
            type="submit"
            form={NEW_NOTE_FORM_ID}
            disabled={isBusy}
            className="w-full whitespace-nowrap sm:w-auto"
          >
            {isProcessingPhotos
              ? t("processingPhotos")
              : isSubmitting
                ? t("submitting")
                : t("submit")}
          </Button>
        </AddItemPanelFooter>
      </FieldGroup>
    </form>
  );
}
