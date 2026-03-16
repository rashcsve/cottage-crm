"use client";

import { useActionState, useEffect, useRef } from "react";
import { addNoteAction } from "./actions";
import { initialActionState } from "@/lib/types/action-state";
import { SubmitButton } from "../ui/SubmitButton";
import { FormMessage } from "../ui/FormMessage";

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
          <FormMessage
            type={state.ok ? "success" : "error"}
            message={state.message}
          />
        )}
      </form>
    </section>
  );
}
