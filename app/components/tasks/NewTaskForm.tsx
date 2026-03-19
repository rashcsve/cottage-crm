"use client";

import { addTaskAction } from "@/features/tasks/server/actions";
import { useActionState, useEffect, useRef } from "react";
import { initialActionState } from "@/lib/types/action-state";
import { SubmitButton } from "@/shared/ui/SubmitButton";
import { FormMessage } from "@/shared/ui/FormMessage";
import { FormSurface } from "@/shared/ui/FormSurface";
import { FieldLabel } from "@/shared/ui/FieldLabel";

type NewTaskFormProps = {
  id?: string;
};

export function NewTaskForm({ id }: NewTaskFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useActionState(addTaskAction, initialActionState);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state.ok]);

  return (
    <FormSurface>
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-stone-900">Nový úkol</h2>
        <p className="text-sm leading-6 text-stone-600">
          Přidej další práci, ať je hned vidět v přehledu.
        </p>
      </div>

      <form
        id={id}
        ref={formRef}
        action={formAction}
        className="mt-4 space-y-3"
      >
        <div className="space-y-2">
          <FieldLabel htmlFor="new-task">Název úkolu</FieldLabel>

          <input
            id="new-task"
            type="text"
            name="title"
            required
            placeholder="Např. natřít lavičku"
            className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 outline-none transition focus:border-stone-500"
          />
        </div>

        <SubmitButton idleLabel="Přidat úkol" pendingLabel="Přidávám..." />

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
