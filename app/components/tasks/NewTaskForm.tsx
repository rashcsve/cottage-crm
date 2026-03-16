"use client";

import { useState } from "react";

type NewTaskFormProps = {
  onAddTask: (title: string) => void;
};

export function NewTaskForm({ onAddTask }: NewTaskFormProps) {
  const [title, setTitle] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedTitle = title.trim();

    if (!trimmedTitle) return;

    onAddTask(trimmedTitle);
    setTitle("");
  }

  return (
    <section className="mb-8 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <form onSubmit={handleSubmit}>
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
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Např. natřít lavičku"
            className="flex-1 rounded-xl border border-stone-300 bg-white px-4 py-3 outline-none transition focus:border-stone-500"
          />

          <button
            type="submit"
            className="rounded-xl bg-stone-800 px-5 py-3 font-medium text-white transition hover:bg-stone-700"
          >
            Přidat úkol
          </button>
        </div>
      </form>
    </section>
  );
}
