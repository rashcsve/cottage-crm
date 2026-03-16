"use client";

import { useActionState, useEffect, useRef } from "react";
import { addNoteAction } from "./actions";
import { initialActionState } from "../../../lib/types/action-state";
import { SubmitButton } from "../ui/SubmitButton";

export function NewNoteForm() {
  const formRef = useRef<HTMLFormElement>(null);

  const [state, formAction] = useActionState(addNoteAction, initialActionState);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state.ok]);

  return (
    <section className="mb-8 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <form ref={formRef} action={formAction}>
        <label
          htmlFor="new-note"
          className="mb-2 block text-sm font-medium text-stone-700"
        >
          Nová poznámka
        </label>

        <div className="space-y-3">
          <textarea
            id="new-note"
            name="content"
            required
            rows={4}
            placeholder="Co se na chatě dělo, co je potřeba vědět..."
            className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 outline-none transition focus:border-stone-500"
          />

          <SubmitButton idleLabel="Přidat poznámku" pendingLabel="Ukládám..." />
        </div>

        {state.message && !state.ok && (
          <div
            className={`mt-3 rounded-xl px-4 py-3 text-sm ${
              state.ok
                ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {state.message}
          </div>
        )}
      </form>
    </section>
  );
}
