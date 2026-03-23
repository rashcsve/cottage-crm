"use client";

import { addTaskAction } from "@/features/tasks/server/actions";
import { FormMessage } from "@/shared/ui/FormMessage";
import { useActionState, useEffect, useId, useRef, useState } from "react";
import { CreateTaskResult } from "../../types/actions.types";

const initialState: CreateTaskResult = {
  ok: false,
  error: "",
};

export function NewTaskForm() {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const id = useId();

  const [state, formAction, isSubmitting] = useActionState(
    addTaskAction,
    initialState
  );

  const errorMessage = !state.ok ? state.error : null;
  const showSuccessMessage = state.ok && !isSubmitting;

  const titleFieldId = `${id}-title`;
  const descriptionFieldId = `${id}-description`;
  const priorityFieldId = `${id}-priority`;
  const dueDateFieldId = `${id}-due-date`;
  const advancedSectionId = `${id}-advanced`;

  useEffect(() => {
    if (!showSuccessMessage) return;

    formRef.current?.reset();
  }, [showSuccessMessage]);

  return (
    <section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
      <div className="space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">
          Rychlé přidání
        </p>
        <h2 className="text-lg font-semibold text-stone-900">Nový úkol</h2>
        <p className="text-sm leading-6 text-stone-600">
          Přidej práci rychle. Další detaily můžeš rozbalit níž.
        </p>
      </div>

      {errorMessage && (
        <div className="mt-3">
          <FormMessage type="error" message={errorMessage} />
        </div>
      )}

      {showSuccessMessage && (
        <div className="mt-3">
          <FormMessage type="success" message="Úkol byl vytvořen" />
        </div>
      )}

      <form ref={formRef} action={formAction} className="mt-4 space-y-4">
        <div className="space-y-2">
          <label
            htmlFor={titleFieldId}
            className="text-sm font-medium text-stone-800"
          >
            Název úkolu
            <span aria-label="required" className="ml-1 text-red-500">
              *
            </span>
          </label>
          <input
            id={titleFieldId}
            name="title"
            type="text"
            required
            disabled={isSubmitting}
            placeholder="Např. posekat trávu"
            className="h-11 w-full rounded-2xl border border-stone-200 bg-white px-4 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-stone-400"
            aria-required="true"
            aria-invalid={errorMessage ? "true" : "false"}
          />
        </div>

        <details
          open={isAdvancedOpen}
          onToggle={(event) => setIsAdvancedOpen(event.currentTarget.open)}
          className="group"
        >
          <summary
            className="cursor-pointer select-none list-none text-sm font-medium text-stone-600 transition hover:text-stone-900"
            aria-controls={advancedSectionId}
            aria-expanded={isAdvancedOpen}
          >
            <span className="inline-block transition group-open:rotate-90">
              ▶
            </span>
            {" Více možností"}
          </summary>

          {isAdvancedOpen && (
            <div id={advancedSectionId} className="space-y-4 pt-4">
              <div className="space-y-2">
                <label
                  htmlFor={descriptionFieldId}
                  className="text-sm font-medium text-stone-800"
                >
                  Popis
                </label>
                <textarea
                  id={descriptionFieldId}
                  name="description"
                  placeholder="Volitelně doplň detaily"
                  rows={3}
                  className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-2 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-stone-400"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label
                    htmlFor={priorityFieldId}
                    className="text-sm font-medium text-stone-800"
                  >
                    Priorita
                  </label>
                  <select
                    id={priorityFieldId}
                    name="priority"
                    defaultValue="medium"
                    className="h-11 w-full rounded-2xl border border-stone-200 bg-white px-4 text-sm text-stone-900 outline-none transition focus:border-stone-400"
                  >
                    <option value="low">Nízká</option>
                    <option value="medium">Střední</option>
                    <option value="high">Vysoká</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor={dueDateFieldId}
                    className="text-sm font-medium text-stone-800"
                  >
                    Termín
                  </label>
                  <input
                    id={dueDateFieldId}
                    name="due_date"
                    type="date"
                    className="h-11 w-full rounded-2xl border border-stone-200 bg-white px-4 text-sm text-stone-900 outline-none transition focus:border-stone-400"
                  />
                </div>
              </div>
            </div>
          )}
        </details>

        <button
          type="submit"
          className="h-11 w-full rounded-2xl bg-stone-900 text-sm font-semibold text-white transition hover:bg-stone-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          aria-busy={isSubmitting}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Přidávám..." : "Přidat úkol"}
        </button>
      </form>
    </section>
  );
}
