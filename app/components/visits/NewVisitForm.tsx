"use client";

import { addVisitActions } from "@/app/(dashboard)/visits/actions";
import { initialActionState } from "@/lib/types/action-state";
import { useActionState, useEffect, useRef } from "react";
import { SubmitButton } from "@/app/components/ui/SubmitButton";
import { FormMessage } from "@/app/components/ui/FormMessage";
import { FormSurface } from "@/app/components/ui/FormSurface";
import { FieldLabel } from "@/app/components/ui/FieldLabel";
import { FieldGroup } from "@/app/components/ui/FieldGroup";

const FIELD_CLASS_NAME =
  "w-full rounded-xl border border-stone-300 bg-white px-4 py-3 outline-none transition focus:border-stone-500";

export function NewVisitForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useActionState(
    addVisitActions,
    initialActionState
  );

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state.ok]);

  return (
    <FormSurface className="mb-8">
      <form ref={formRef} action={formAction} className="space-y-4">
        <FieldGroup>
          <div>
            <FieldLabel htmlFor="visitor-name">Kdo přijede</FieldLabel>
            <input
              id="visitor-name"
              name="visitorName"
              type="text"
              required
              placeholder="Např. Světlana a Filip"
              className={FIELD_CLASS_NAME}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <FieldLabel htmlFor="date-from">Od</FieldLabel>
              <input
                id="date-from"
                name="dateFrom"
                type="date"
                required
                className={FIELD_CLASS_NAME}
              />
            </div>

            <div>
              <FieldLabel htmlFor="date-to">Do</FieldLabel>
              <input
                id="date-to"
                name="dateTo"
                type="date"
                required
                className={FIELD_CLASS_NAME}
              />
            </div>
          </div>

          <div>
            <FieldLabel htmlFor="visit-note">Poznámka</FieldLabel>
            <textarea
              id="visit-note"
              name="note"
              rows={3}
              placeholder="Např. vezmeme gril a uhlí"
              className={FIELD_CLASS_NAME}
            />
          </div>

          <SubmitButton idleLabel="Přidat návštěvu" pendingLabel="Ukládám..." />
        </FieldGroup>

        {state.message && (
          <FormMessage
            type={state.ok ? "success" : "error"}
            message={state.message}
          />
        )}
      </form>
    </FormSurface>
  );
}
