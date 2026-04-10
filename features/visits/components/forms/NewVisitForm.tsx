"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { useRouter } from "@/i18n/navigation";
import { useToast } from "@/shared/Toast/useToast";
import { FormMessage } from "@/shared/ui/FormMessage";
import { FormSurface } from "@/shared/ui/FormSurface";
import { FieldLabel } from "@/shared/ui/FieldLabel";
import { FieldGroup } from "@/shared/ui/FieldGroup";
import { FieldError } from "@/shared/ui/Form/FieldError";
import { formInputClass } from "@/shared/ui/Form/formStyles";
import { createVisitAction } from "../../server/actions";
import {
  createVisitSchema,
  type CreateVisitFormData,
  type CreateVisitFormInput,
} from "../../schemas";
import { getCreateVisitSchemaMessages } from "../../utils/get-create-visit-schema-messages";

const defaultValues: CreateVisitFormInput = {
  visitorName: "",
  dateFrom: "",
  dateTo: "",
  note: "",
};

export function NewVisitForm() {
  const router = useRouter();
  const t = useTranslations("visits.form");
  const { error: showErrorToast, success: showSuccessToast } = useToast();

  const schema = createVisitSchema(getCreateVisitSchemaMessages(t));

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError,
    clearErrors,
  } = useForm<CreateVisitFormInput, undefined, CreateVisitFormData>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues,
  });

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
        reset();
        router.refresh();
        return;
      }

      if (result.fieldErrors) {
        Object.entries(result.fieldErrors).forEach(([field, message]) => {
          setError(field as keyof CreateVisitFormInput, { message });
        });
      }

      setError("root", { message: result.error });
      showErrorToast(result.error);
    } catch (error) {
      console.error("[NewVisitForm] Submit error:", error);
      const message = error instanceof Error ? error.message : t("error");
      setError("root", { message });
      showErrorToast(message);
    }
  }

  return (
    <FormSurface className="mb-8">
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        id="new-visit-form"
        className="space-y-4"
      >
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">
            {t("eyebrow")}
          </p>
          <h2 className="text-lg font-semibold text-stone-900">{t("title")}</h2>
        </div>

        {errors.root?.message && (
          <FormMessage type="error" message={errors.root.message} />
        )}

        <FieldGroup>
          <div>
            <FieldLabel htmlFor="visitor-name">{t("visitorName")}</FieldLabel>
            <input
              id="visitor-name"
              type="text"
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
                {...register("dateFrom")}
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
                disabled={isSubmitting}
                aria-invalid={!!errors.dateTo}
                aria-describedby={
                  errors.dateTo ? "date-to-error" : undefined
                }
                className={formInputClass(!!errors.dateTo)}
                {...register("dateTo")}
              />
              <FieldError
                id="date-to-error"
                message={errors.dateTo?.message}
              />
            </div>
          </div>

          <div>
            <FieldLabel htmlFor="visit-note">{t("note")}</FieldLabel>
            <textarea
              id="visit-note"
              rows={3}
              placeholder={t("notePlaceholder")}
              disabled={isSubmitting}
              aria-invalid={!!errors.note}
              aria-describedby={
                errors.note ? "visit-note-error" : undefined
              }
              className={formInputClass(!!errors.note)}
              {...register("note")}
            />
            <FieldError id="visit-note-error" message={errors.note?.message} />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? t("submitting") : t("submit")}
          </button>
        </FieldGroup>
      </form>
    </FormSurface>
  );
}
