"use client";

import { useActionState, useEffect, useRef } from "react";
import { addNoteAction } from "../../(dashboard)/notes/actions";
import { initialActionState } from "@/lib/types/action-state";
import { SubmitButton } from "@/shared/ui/SubmitButton";
import { FormMessage } from "@/shared/ui/FormMessage";
import { FormSurface } from "@/shared/ui/FormSurface";
import { FieldLabel } from "@/shared/ui/FieldLabel";

export function NewNoteForm() {
  const formRef = useRef<HTMLFormElement>(null);

  const [state, formAction] = useActionState(addNoteAction, initialActionState);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state.ok]);

  return (
    <FormSurface className="mb-8">
      <form ref={formRef} action={formAction}>
        <FieldLabel htmlFor="new-note">Nová poznámka</FieldLabel>

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
    </FormSurface>
  );
}
