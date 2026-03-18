"use client";

import { useActionState, useEffect, useRef } from "react";
import { addShoppingItemAction } from "./actions";
import { initialActionState } from "@/lib/types/action-state";
import { SubmitButton } from "@/app/components/ui/SubmitButton";
import { FormMessage } from "@/app/components/ui/FormMessage";
import { FormSurface } from "@/app/components/ui/FormSurface";
import { FieldLabel } from "@/app/components/ui/FieldLabel";

export function NewShoppingItemForm() {
  const formRef = useRef<HTMLFormElement>(null);

  const [state, formAction] = useActionState(
    addShoppingItemAction,
    initialActionState
  );

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state.ok]);

  return (
    <FormSurface className="mb-8">
      <form ref={formRef} action={formAction}>
        <FieldLabel htmlFor="new-shopping-item">Nová položka</FieldLabel>

        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            id="new-shopping-item"
            name="title"
            type="text"
            required
            placeholder="Např. toaletní papír"
            className="flex-1 rounded-xl border border-stone-300 bg-white px-4 py-3 outline-none transition focus:border-stone-500"
          />

          <SubmitButton idleLabel="Přidat položku" pendingLabel="Přidávám..." />
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
