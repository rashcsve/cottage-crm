"use client";

import { addVisitActions } from "@/app/(dashboard)/visits/actions";
import { initialActionState } from "@/lib/types/action-state";
import { useActionState, useEffect, useRef } from "react";
import { Surface } from "../ui/Surface";
import { SubmitButton } from "../ui/SubmitButton";
import { FormMessage } from "../ui/FormMessage";

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
    <Surface className="mb-8 p-5">
      <form ref={formRef} action={formAction} className="space-y-4">
        <div>
          <label
            htmlFor="visitor-name"
            className="mb-2 block text-sm font-medium text-stone-700"
          >
            Kdo přijede
          </label>
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
            <label
              htmlFor="date-from"
              className="mb-2 block text-sm font-medium text-stone-700"
            >
              Od
            </label>
            <input
              id="date-from"
              name="dateFrom"
              type="date"
              required
              className={FIELD_CLASS_NAME}
            />
          </div>

          <div>
            <label
              htmlFor="date-to"
              className="mb-2 block text-sm font-medium text-stone-700"
            >
              Do
            </label>
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
          <label
            htmlFor="visit-note"
            className="mb-2 block text-sm font-medium text-stone-700"
          >
            Poznámka
          </label>
          <textarea
            id="visit-note"
            name="note"
            rows={3}
            placeholder="Např. vezmeme gril a uhlí"
            className={FIELD_CLASS_NAME}
          />
        </div>

        <SubmitButton idleLabel="Přidat návštěvu" pendingLabel="Ukládám..." />

        {state.message && (
          <FormMessage
            type={state.ok ? "success" : "error"}
            message={state.message}
          />
        )}
      </form>
    </Surface>
  );
}
