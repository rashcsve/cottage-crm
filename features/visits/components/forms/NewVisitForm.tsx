"use client";

import { useEffect, useMemo, useRef } from "react";
import { X } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { useForm, useWatch } from "react-hook-form";
import { useToast } from "@/shared/Toast/useToast";
import { FormMessage } from "@/shared/ui/FormMessage";
import { FieldLabel } from "@/shared/ui/FieldLabel";
import { FieldGroup } from "@/shared/ui/FieldGroup";
import { FieldError } from "@/shared/ui/Form/FieldError";
import { formInputClass } from "@/shared/ui/Form/formStyles";
import {
  createVisitSchema,
  type CreateVisitFormData,
  type CreateVisitFormInput,
} from "../../schemas";
import { getCreateVisitSchemaMessages } from "../../schemas/create-visit-schema-messages";
import type { CalendarDateRange } from "../../domain/visits-calendar-types";
import { formatVisitCompactDate } from "../../shared/formatVisitDate";
import type { Visit } from "../../types/visits";
import { createVisitAction } from "../../server/actions";
import { Button } from "@/shared/ui/Button";

const NEW_VISIT_FORM_ID = "new-visit-form";
const NEW_VISIT_FORM_TITLE_ID = "new-visit-form-title";

const FORM_FIELDS = ["visitorName", "dateFrom", "dateTo", "note"] as const;
type FormFieldName = (typeof FORM_FIELDS)[number];

export interface NewVisitFormProps {
  draftRange: CalendarDateRange | null;
  currentUserName?: string;
  onClose: () => void;
  onCreateSuccess: (visit: Visit) => void;
}

export function NewVisitForm({
  draftRange,
  currentUserName = "",
  onClose,
  onCreateSuccess,
}: NewVisitFormProps) {
  const locale = useLocale();
  const t = useTranslations("visits.form");
  const { error: showErrorToast, success: showSuccessToast } = useToast();
  const lastAppliedDraftKeyRef = useRef<string | null>(null);

  const schema = useMemo(() => {
    return createVisitSchema(getCreateVisitSchemaMessages(t));
  }, [t]);
  const formDefaults = useMemo<CreateVisitFormInput>(
    () => ({
      visitorName: currentUserName,
      dateFrom: "",
      dateTo: "",
      note: "",
    }),
    [currentUserName]
  );

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError,
    clearErrors,
    setFocus,
    getValues,
    setValue,
  } = useForm<CreateVisitFormInput, undefined, CreateVisitFormData>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues: formDefaults,
  });

  const dateFrom = useWatch({ control, name: "dateFrom" });
  const selectedRangeLabel = useMemo(() => {
    if (!draftRange) {
      return null;
    }

    if (draftRange.dateFrom === draftRange.dateTo) {
      return t("selectedSingleDay", {
        date: formatVisitCompactDate(draftRange.dateFrom, locale),
      });
    }

    return t("selectedRange", {
      start: formatVisitCompactDate(draftRange.dateFrom, locale),
      end: formatVisitCompactDate(draftRange.dateTo, locale),
    });
  }, [draftRange, locale, t]);

  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      setFocus("visitorName");
    });

    return () => cancelAnimationFrame(frameId);
  }, [setFocus]);

  useEffect(() => {
    if (!draftRange) {
      lastAppliedDraftKeyRef.current = null;
      return;
    }

    const nextDraftKey = `${draftRange.dateFrom}:${draftRange.dateTo}`;

    if (lastAppliedDraftKeyRef.current === nextDraftKey) {
      return;
    }

    setValue("dateFrom", draftRange.dateFrom, {
      shouldDirty: false,
      shouldValidate: true,
    });
    setValue("dateTo", draftRange.dateTo, {
      shouldDirty: false,
      shouldValidate: true,
    });
    clearErrors(["dateFrom", "dateTo"]);
    lastAppliedDraftKeyRef.current = nextDraftKey;
  }, [clearErrors, draftRange, setValue]);

  function handleCloseComposer() {
    clearErrors();
    reset(formDefaults);
    onClose();
  }

  function applyFieldErrors(
    fieldErrors?: Partial<Record<FormFieldName, string | undefined>>
  ) {
    let firstInvalidField: FormFieldName | null = null;

    for (const fieldName of FORM_FIELDS) {
      const message = fieldErrors?.[fieldName];

      if (!message) continue;

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

  async function onSubmit(data: CreateVisitFormData) {
    clearErrors("root");

    const normalizedData: CreateVisitFormData = {
      ...data,
      note: data.note?.trim() ? data.note : null,
    };

    try {
      const result = await createVisitAction(normalizedData);

      if (result.ok) {
        showSuccessToast(result.message ?? t("success"));
        if (result.data) {
          reset(formDefaults);
          onCreateSuccess(result.data);
        } else {
          throw new Error("Visit data is undefined");
        }
        return;
      }

      const errorMessage = result.error ?? t("error");
      const firstInvalidField = applyFieldErrors(result.fieldErrors);

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
      console.error("[NewVisitForm] Unexpected submit error:", error);
      const message = t("error");

      setError("root", {
        type: "server",
        message,
      });

      showErrorToast(message);
    }
  }

  const sectionClassName =
    "rounded-3xl border border-stone-200 bg-white p-4 shadow-sm";
  const closeButtonClassName =
    "inline-flex items-center gap-2 self-start rounded-xl px-2 py-1 text-sm font-medium text-stone-600 transition hover:bg-stone-100 hover:text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:ring-offset-2";

  return (
    <section
      id={NEW_VISIT_FORM_ID}
      aria-labelledby={NEW_VISIT_FORM_TITLE_ID}
      aria-busy={isSubmitting}
      className={sectionClassName}
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2
              id={NEW_VISIT_FORM_TITLE_ID}
              className="text-base font-semibold text-stone-900"
            >
              {t("title")}
            </h2>
          </div>

          <button
            type="button"
            onClick={handleCloseComposer}
            className={closeButtonClassName}
          >
            <X className="h-4 w-4" aria-hidden="true" />
            <span>{t("closeComposer")}</span>
          </button>
        </div>

        {selectedRangeLabel ? (
          <div className="rounded-2xl border border-stone-200 bg-stone-50 px-3 py-2.5">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-stone-500">
              {t("selectedDates")}
            </p>
            <p className="mt-1 text-sm font-medium text-stone-900">
              {selectedRangeLabel}
            </p>
          </div>
        ) : null}

        {errors.root?.message && (
          <FormMessage type="error" message={errors.root.message} />
        )}

        <FieldGroup className="space-y-3">
          <div className="grid gap-3">
            <div>
              <FieldLabel htmlFor="visitor-name">{t("visitorName")}</FieldLabel>
              <input
                id="visitor-name"
                type="text"
                maxLength={255}
                placeholder={t("visitorNamePlaceholder")}
                disabled={isSubmitting}
                aria-invalid={!!errors.visitorName}
                aria-describedby={
                  errors.visitorName ? "visitor-name-error" : undefined
                }
                className={formInputClass(!!errors.visitorName)}
                {...register("visitorName")}
              />
              <FieldError
                id="visitor-name-error"
                message={errors.visitorName?.message}
              />
              {currentUserName ? (
                <p className="mt-1 text-xs leading-5 text-stone-500">
                  {t("visitorNameHint", { name: currentUserName })}
                </p>
              ) : null}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <FieldLabel htmlFor="date-from">{t("dateFrom")}</FieldLabel>
              <input
                id="date-from"
                type="date"
                disabled={isSubmitting}
                aria-invalid={!!errors.dateFrom}
                aria-describedby={
                  errors.dateFrom ? "date-from-error" : undefined
                }
                className={formInputClass(!!errors.dateFrom)}
                {...register("dateFrom", {
                  onChange: (event) => {
                    const nextDateFrom = event.target.value;
                    const currentDateTo = getValues("dateTo");

                    if (
                      nextDateFrom &&
                      (!currentDateTo || currentDateTo < nextDateFrom)
                    ) {
                      setValue("dateTo", nextDateFrom, {
                        shouldDirty: Boolean(currentDateTo),
                        shouldValidate: Boolean(currentDateTo),
                      });
                    }
                  },
                })}
              />
              <FieldError
                id="date-from-error"
                message={errors.dateFrom?.message}
              />
            </div>

            <div>
              <FieldLabel htmlFor="date-to">{t("dateTo")}</FieldLabel>
              <input
                id="date-to"
                type="date"
                min={dateFrom || undefined}
                disabled={isSubmitting}
                aria-invalid={!!errors.dateTo}
                aria-describedby={errors.dateTo ? "date-to-error" : undefined}
                className={formInputClass(!!errors.dateTo)}
                {...register("dateTo")}
              />
              <FieldError id="date-to-error" message={errors.dateTo?.message} />
            </div>
          </div>

          <div>
            <FieldLabel htmlFor="visit-note">{t("note")}</FieldLabel>
            <textarea
              id="visit-note"
              rows={2}
              maxLength={1000}
              placeholder={t("notePlaceholder")}
              disabled={isSubmitting}
              aria-invalid={!!errors.note}
              aria-describedby={errors.note ? "visit-note-error" : undefined}
              className={`${formInputClass(!!errors.note)} min-h-22 resize-y`}
              {...register("note")}
            />
            <FieldError id="visit-note-error" message={errors.note?.message} />
          </div>

          <div className="flex flex-col gap-3 border-t border-stone-200 pt-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-5 text-stone-500">
              {t("submitHint")}
            </p>
            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
              {isSubmitting ? t("submitting") : t("submit")}
            </Button>
          </div>
        </FieldGroup>
      </form>
    </section>
  );
}
