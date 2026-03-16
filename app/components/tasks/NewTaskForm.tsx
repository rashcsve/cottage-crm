"use client";

import { addTaskAction } from "@/components/tasks/actions";
import { SubmitButton } from "@/components/tasks/SubmitButton";

export function NewTaskForm() {
  return (
    <section className="mb-8 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <form action={addTaskAction}>
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
      </form>
    </section>
  );
}
