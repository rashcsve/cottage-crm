"use client";

import { useTranslations } from "next-intl";
import { Trash2 } from "lucide-react";
import type { Visit } from "../types/visits";

interface VisitActionsProps {
  visit: Visit;
  onDelete: (visit: Visit) => void;
}

export function VisitActions({ visit, onDelete }: VisitActionsProps) {
  const t = useTranslations("visits");

  return (
    <button
      type="button"
      onClick={() => onDelete(visit)}
      className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-500 transition hover:border-stone-300 hover:text-stone-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      aria-label={`${t("aria.deleteVisit")} ${visit.visitorName}`}
    >
      <Trash2 className="h-4 w-4" aria-hidden="true" />
    </button>
  );
}
