"use client";

import { useTranslations } from "next-intl";
import type { Task } from "@/features/tasks/types/task.types";

interface TaskDeleteDialogProps {
  task: Task;
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
  isDeleting: boolean;
}

export function TaskDeleteDialog({
  task,
  isOpen,
  onCancel,
  onConfirm,
  isDeleting,
}: TaskDeleteDialogProps) {
  const t = useTranslations("tasks.delete");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-stone-900">{t("title")}</h2>
        <p className="mt-2 text-sm text-stone-600">
          {t("message")}{" "}
          <span className="font-medium">&quot;{task.title}&quot;</span>?{" "}
          {t("warning")}
        </p>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 rounded-xl border cursor-pointer border-stone-200 bg-white px-4 py-2.5 text-sm font-semibold text-stone-900 transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t("cancel")}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 rounded-xl cursor-pointer bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isDeleting ? t("deleting") : t("confirm")}
          </button>
        </div>
      </div>
    </div>
  );
}
