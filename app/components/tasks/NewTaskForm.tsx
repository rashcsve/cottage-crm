"use client";

import { addTaskAction } from "@/components/tasks/actions";
import { SubmitButton } from "@/components/tasks/SubmitButton";
import { useActionState, useEffect, useRef } from "react";
import { initialActionState } from "@/../lib/types/action-state";

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

          <SubmitButton />
        </div>

        {!state.ok && state.message && (
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
