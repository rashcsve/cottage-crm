"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
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

const NEW_NOTE_FORM_ID = "new-note-form";
const NEW_NOTE_FORM_TITLE_ID = "new-note-form-title";
const FORM_FIELDS = ["content"] as const;

type FormFieldName = (typeof FORM_FIELDS)[number];

const defaultValues: CreateNoteFormInput = {
  content: "",
};

export function NewNoteForm() {
  const router = useRouter();
  const t = useTranslations("notes.form");
  const { error: showErrorToast, success: showSuccessToast } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);

  const schema = useMemo(() => {
    return createNoteSchema(getCreateNoteSchemaMessages(t));
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

  function openComposer() {
    clearErrors();
    setIsExpanded(true);

    requestAnimationFrame(() => {
      setFocus("content");
    });
  }

  function closeComposer() {
    clearErrors();
    reset(defaultValues);
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

      setError(fieldName, {
        type: "server",
        message,
      });

      if (!firstInvalidField) {
        firstInvalidField = fieldName;
      }
    }

    return firstInvalidField;
  }

  async function onSubmit(data: CreateNoteFormData) {
    clearErrors("root");

    try {
      const result = await addNoteAction(data);

      if (result.ok) {
        const nextHref = result.data?.id
          ? `/notes#note-${result.data.id}`
          : "/notes";

        showSuccessToast(result.message ?? t("success"));
        reset(defaultValues);
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

      if (firstInvalidField) {
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
