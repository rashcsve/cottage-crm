"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../lib/supabase/client";
import { TaskStatus } from "./types";

type TaskActionsProps = {
  taskId: number;
  currentStatus: TaskStatus;
};

export function TaskActions({ taskId, currentStatus }: TaskActionsProps) {
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  async function handleToggleTask() {
    const supabase = createClient();
    const nextStatus: TaskStatus =
      currentStatus === "pending" ? "done" : "pending";

    setIsSaving(true);

    const { error } = await supabase
      .from("tasks")
      .update({ status: nextStatus })
      .eq("id", taskId);

    setIsSaving(false);

    if (error) {
      alert(`Nepodařilo se změnit stav úkolu: ${error.message}`); // TODO
      return;
    }

    router.refresh();
  }

  async function handleDeleteTask() {
    const supabase = createClient();

    setIsSaving(true);

    const { error } = await supabase.from("tasks").delete().eq("id", taskId);

    setIsSaving(false);

    if (error) {
      alert(`Nepodařilo se smazat úkol: ${error.message}`); // TODO
      return;
    }

    router.refresh();
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={handleToggleTask}
        disabled={isSaving}
        className="rounded-xl border border-stone-300 px-4 py-2 text-sm font-medium transition hover:bg-stone-100 cursor-pointer"
      >
        {currentStatus === "pending" ? "Označit jako hotovo" : "Vrátit na čeká"}
      </button>

      <button
        type="button"
        onClick={handleDeleteTask}
        disabled={isSaving}
        className="rounded-xl border border-red-200 px-4 py-2 text-sm text-red-700 font-medium transition hover:bg-red-50 cursor-pointer"
      >
        Smazat
      </button>
    </div>
  );
}
