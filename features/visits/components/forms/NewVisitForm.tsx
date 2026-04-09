"use client";

import { useTranslations } from "next-intl";
import { useActionState, useEffect, useRef } from "react";
import { SubmitButton } from "@/shared/ui/SubmitButton";
import { FormMessage } from "@/shared/ui/FormMessage";
import { FormSurface } from "@/shared/ui/FormSurface";
import { FieldLabel } from "@/shared/ui/FieldLabel";
import { FieldGroup } from "@/shared/ui/FieldGroup";
import { FieldError } from "@/shared/ui/Form/FieldError";
import { createVisitAction } from "../../server/actions";

const FIELD_CLASS_NAME =
  "w-full rounded-xl border border-stone-300 bg-white px-4 py-3 outline-none transition focus:border-stone-500";

const initialActionState = { ok: false, error: "", fieldErrors: {} };

export function NewVisitForm() {
  const t = useTranslations("visits.form");
  const tErrors = useTranslations("visits.errors");

  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useActionState(
    async (_: unknown, formData: FormData) => {
      const input = {
        visitorName: formData.get("visitorName") as string,
        dateFrom: formData.get("dateFrom") as string,
        dateTo: formData.get("dateTo") as string,
        note: (formData.get("note") as string) || null,
      };
      return createVisitAction(input);
    },
    initialActionState
  );

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
    }
  }, [state.ok]);

  return (
    <FormSurface className="mb-8">
      <form ref={formRef} action={formAction} className="space-y-4">
        <FieldGroup>
          <div>
            <FieldLabel htmlFor="visitor-name">{t("visitorName")}</FieldLabel>
            <input
              id="visitor-name"
              name="visitorName"
              type="text"
              required
              placeholder={t("visitorNamePlaceholder")}
              className={FIELD_CLASS_NAME}
            />
            {state.fieldErrors?.visitorName && (
              <FieldError
                id="visitor-name-error"
                message={tErrors(state.fieldErrors.visitorName)}
              />
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <FieldLabel htmlFor="date-from">{t("dateFrom")}</FieldLabel>
              <input
                id="date-from"
                name="dateFrom"
                type="date"
                required
                className={FIELD_CLASS_NAME}
              />
              {state.fieldErrors?.dateFrom && (
                <FieldError
                  id="date-from-error"
                  message={tErrors(state.fieldErrors.dateFrom)}
                />
              )}
            </div>

            <div>
              <FieldLabel htmlFor="date-to">{t("dateTo")}</FieldLabel>
              <input
                id="date-to"
                name="dateTo"
                type="date"
                required
                className={FIELD_CLASS_NAME}
              />
              {state.fieldErrors?.dateTo && (
                <FieldError
                  id="date-to-error"
                  message={tErrors(state.fieldErrors.dateTo)}
                />
              )}
            </div>
          </div>

          <div>
            <FieldLabel htmlFor="visit-note">{t("note")}</FieldLabel>
            <textarea
              id="visit-note"
              name="note"
              rows={3}
              placeholder={t("notePlaceholder")}
              className={FIELD_CLASS_NAME}
            />
            {state.fieldErrors?.note && (
              <FieldError
                id="visit-note-error"
                message={tErrors(state.fieldErrors.note)}
              />
            )}
          </div>

          <SubmitButton
            idleLabel={t("submit")}
            pendingLabel={t("submitting")}
          />
        </FieldGroup>

        {state.error && !state.ok && (
          <FormMessage type="error" message={tErrors(state.error)} />
        )}
      </form>
    </FormSurface>
  );
}
