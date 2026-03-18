"use client";

import { addTaskAction } from "@/app/components/tasks/actions";
import { useActionState, useEffect, useRef } from "react";
import { initialActionState } from "@/lib/types/action-state";
import { SubmitButton } from "@/app/components/ui/SubmitButton";
import { FormMessage } from "@/app/components/ui/FormMessage";
import { FormSurface } from "@/app/components/ui/FormSurface";
import { FieldLabel } from "@/app/components/ui/FieldLabel";

export function NewTaskForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useActionState(addTaskAction, initialActionState);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state.ok]);

  return (
    <FormSurface className="mb-8">
      <form ref={formRef} action={formAction}>
        <FieldLabel htmlFor="new-task">Nový úkol</FieldLabel>

        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            id="new-task"
            type="text"
            name="title"
            required
            placeholder="Např. natřít lavičku"
            className="flex-1 rounded-xl border border-stone-300 bg-white px-4 py-3 outline-none transition focus:border-stone-500"
          />

          <SubmitButton idleLabel="Přidat úkol" pendingLabel="Přidávám..." />
        </div>

        {!state.ok && state.message && (
          <FormMessage
            type={state.ok ? "success" : "error"}
            message={state.message}
          />
        )}
      </form>
    </FormSurface>
  );
}
