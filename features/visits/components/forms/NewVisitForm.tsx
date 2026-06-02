"use client";

import { useEffect, useMemo, useRef } from "react";
import { useAutoFocus } from "@/shared/hooks/useAutoFocus";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { useForm, useWatch } from "react-hook-form";
import { useToast } from "@/shared/Toast/useToast";
import {
  TextAreaField,
  TextField,
} from "@/shared/ui/Form/Field";
import {
  FormComposer,
  FormSubmitBar,
} from "@/shared/ui/Form/FormComposer";
import { FormMessage } from "@/shared/ui/FormMessage";
import { FieldGroup } from "@/shared/ui/FieldGroup";
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

  useAutoFocus(setFocus, "visitorName");

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
    } catch {
      const message = t("error");

      setError("root", {
        type: "server",
        message,
      });

      showErrorToast(message);
    }
  }

  return (
    <FormComposer
      id={NEW_VISIT_FORM_ID}
      titleId={NEW_VISIT_FORM_TITLE_ID}
      title={t("title")}
      closeLabel={t("closeComposer")}
      closeAriaControls={NEW_VISIT_FORM_ID}
      closeAriaExpanded
      onClose={handleCloseComposer}
      isBusy={isSubmitting}
      headerContent={
        selectedRangeLabel ? (
          <div className="rounded-2xl border border-stone-200 bg-stone-50 px-3 py-2.5">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-stone-500">
              {t("selectedDates")}
            </p>
            <p className="mt-1 text-sm font-medium text-stone-900">
              {selectedRangeLabel}
            </p>
          </div>
        ) : null
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {errors.root?.message && (
          <FormMessage type="error" message={errors.root.message} />
        )}

        <FieldGroup className="space-y-3">
          <div className="grid gap-3">
            <TextField
              id="visitorName"
              type="text"
              maxLength={255}
              placeholder={t("visitorNamePlaceholder")}
              disabled={isSubmitting}
              label={t("visitorName")}
              error={errors.visitorName?.message}
              hint={
                currentUserName
                  ? t("visitorNameHint", { name: currentUserName })
                  : undefined
              }
              {...register("visitorName")}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <TextField
              id="dateFrom"
              type="date"
              disabled={isSubmitting}
              label={t("dateFrom")}
              error={errors.dateFrom?.message}
              {...register("dateFrom", {
                onChange: (event) => {
                  const nextDateFrom = event.target.value;
                  const currentDateTo = getValues("dateTo");

                  if (nextDateFrom && (!currentDateTo || currentDateTo < nextDateFrom)) {
                    setValue("dateTo", nextDateFrom, {
                      shouldDirty: Boolean(currentDateTo),
                      shouldValidate: Boolean(currentDateTo),
                    });
                  }
                },
              })}
            />

            <TextField
              id="dateTo"
              type="date"
              min={dateFrom || undefined}
              disabled={isSubmitting}
              label={t("dateTo")}
              error={errors.dateTo?.message}
              {...register("dateTo")}
            />
          </div>

          <TextAreaField
            id="note"
            rows={2}
            maxLength={1000}
            placeholder={t("notePlaceholder")}
            disabled={isSubmitting}
            label={t("note")}
            error={errors.note?.message}
            className="min-h-22 resize-y"
            {...register("note")}
          />

          <FormSubmitBar hint={t("submitHint")}>
            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
              {isSubmitting ? t("submitting") : t("submit")}
            </Button>
          </FormSubmitBar>
        </FieldGroup>
      </form>
    </FormComposer>
  );
}
