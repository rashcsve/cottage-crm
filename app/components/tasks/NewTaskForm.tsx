"use client";

import { addTaskAction } from "@/components/tasks/actions";
import { useActionState, useEffect, useRef } from "react";
import { initialActionState } from "@/../lib/types/action-state";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { FormMessage } from "@/components/ui/FormMessage";

export function NewTaskForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useActionState(addTaskAction, initialActionState);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state.ok]);

  return (
    <section className="mb-8 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <form ref={formRef} action={formAction}>
        <label
          htmlFor="new-task"
          className="mb-2 block text-sm font-medium text-stone-700"
        >
          Nový úkol
        </label>

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
    </section>
  );
}
