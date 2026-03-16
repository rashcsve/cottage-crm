"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../lib/supabase/client";

export function NewTaskForm() {
  const [title, setTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedTitle = title.trim();

    if (!trimmedTitle) return;

    const supabase = createClient();

    setIsSaving(true);

    const { error } = await supabase.from("tasks").insert({
      title: trimmedTitle,
      status: "pending",
      author: "Svetlana",
    });

    setIsSaving(false);

    if (error) {
      alert(`Nepodařilo se uložit úkol: ${error.message}`);
      return;
    }

    setTitle("");
    router.refresh();
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
            disabled={isSaving}
            className="flex-1 rounded-xl border border-stone-300 bg-white px-4 py-3 outline-none transition focus:border-stone-500"
          />

          <button
            type="submit"
            disabled={isSaving}
            className="rounded-xl bg-stone-800 px-5 py-3 font-medium text-white transition hover:bg-stone-700"
          >
            {isSaving ? "Ukládám..." : "Přidat úkol"}
          </button>
        </div>
      </form>
    </section>
  );
}
