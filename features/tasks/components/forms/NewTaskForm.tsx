"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { addTaskAction } from "@/features/tasks/server/actions";
import { initialActionState } from "@/lib/types/action-state";
import { FormMessage } from "@/shared/ui/FormMessage";
import { FormSurface } from "@/shared/ui/FormSurface";

interface NewTaskFormProps {
  id?: string;
}

export function NewTaskForm({ id }: NewTaskFormProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useActionState(addTaskAction, initialActionState);

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
    }
  }, [state.ok]);

  const advancedId = id ? `${id}-advanced` : "new-task-form-advanced";

  return (
    <section
      id={id}
      className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm"
    >
      <div className="space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">
          Rychlé přidání
        </p>
        <h2 className="text-lg font-semibold text-stone-900">Nový úkol</h2>
        <p className="text-sm leading-6 text-stone-600">
          Přidej práci rychle. Další detaily můžeš rozbalit níž.
        </p>
      </div>

      <form
        ref={formRef}
        action={formAction}
        className="mt-4 space-y-4"
      >
        <div className="space-y-2">
          <label
            htmlFor="task-title"
            className="text-sm font-medium text-stone-800"
          >
            Název úkolu
          </label>
          <input
            id="task-title"
            name="title"
            placeholder="Např. natřít lavičku"
            className="h-11 w-full rounded-2xl border border-stone-200 bg-white px-4 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-stone-400"
          />
        </div>

        <button
          type="button"
          onClick={() => setShowAdvanced((value) => !value)}
          aria-expanded={showAdvanced}
          aria-controls={advancedId}
          className="text-sm font-medium text-stone-700 underline decoration-stone-300 underline-offset-4 transition hover:text-stone-900"
        >
          {showAdvanced ? "Skrýt další možnosti" : "Více možností"}
        </button>

        {showAdvanced ? (
          <FormSurface className="grid gap-4 bg-stone-50">
            <div className="space-y-2">
              <label
                htmlFor="task-description"
                className="text-sm font-medium text-stone-800"
              >
                Popis
              </label>
              <textarea
                id="task-description"
                name="description"
                placeholder="Volitelně doplň detaily"
                rows={3}
                className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-2 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-stone-400"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label
                  htmlFor="task-priority"
                  className="text-sm font-medium text-stone-800"
                >
                  Priorita
                </label>
                <select
                  id="task-priority"
                  name="priority"
                  defaultValue="medium"
                  className="h-11 w-full rounded-2xl border border-stone-200 bg-white px-4 text-sm text-stone-900 outline-none transition focus:border-stone-400"
                >
                  <option value="low">Nízká</option>
                  <option value="medium">Střední</option>
                  <option value="high">Vysoká</option>
                </select>
              </div>

              <div className="space-y-2" id={advancedId} role="region">
                <label
                  htmlFor="task-due-date"
                  className="text-sm font-medium text-stone-800"
                >
                  Termín
                </label>
                <input
                  id="task-due-date"
                  name="due_date"
                  type="date"
                  className="h-11 w-full rounded-2xl border border-stone-200 bg-white px-4 text-sm text-stone-900 outline-none transition focus:border-stone-400"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label
                  htmlFor="task-category"
                  className="text-sm font-medium text-stone-800"
                >
                  Kategorie
                </label>
                <select
                  id="task-category"
                  name="category"
                  defaultValue=""
                  className="h-11 w-full rounded-2xl border border-stone-200 bg-white px-4 text-sm text-stone-900 outline-none transition focus:border-stone-400"
                >
                  <option value="">Bez kategorie</option>
                  <option value="inside">Uvnitř</option>
                  <option value="outside">Venku</option>
                  <option value="maintenance">Údržba</option>
                  <option value="shopping">Nákup</option>
                  <option value="cleaning">Úklid</option>
                  <option value="other">Ostatní</option>
                </select>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="task-assignee-id"
                  className="text-sm font-medium text-stone-800"
                >
                  Přiřazeno (ID)
                </label>
                <input
                  id="task-assignee-id"
                  name="assignee_id"
                  placeholder="Volitelně"
                  className="h-11 w-full rounded-2xl border border-stone-200 bg-white px-4 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-stone-400"
                />
              </div>
            </div>
          </FormSurface>
        ) : null}

        <button
          type="submit"
          className="inline-flex h-11 items-center justify-center rounded-2xl bg-stone-900 px-5 text-sm font-medium text-white transition hover:bg-stone-800"
        >
          Přidat úkol
        </button>

        {state.message ? (
          <FormMessage
            type={state.ok ? "success" : "error"}
            message={state.message}
          />
        ) : null}
      </form>
    </section>
  );
}

