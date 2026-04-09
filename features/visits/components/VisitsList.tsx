"use client";

import { useTranslations } from "next-intl";
import { VisitRow } from "./VisitRow";
import { deleteVisitAction } from "../server/actions";
import type { Visit } from "../types/visits";
import { useRouter } from "@/i18n/navigation";
import { useOptimisticRemoveList } from "@/shared/hooks/useOptimisticRemoveList";

interface VisitsListProps {
  visits: Visit[];
  canManageVisits: boolean;
  today: string;
}

export function VisitsList({
  visits: initialVisits,
  canManageVisits,
  today,
}: VisitsListProps) {
  const tEmpty = useTranslations("visits.empty");
  const tDelete = useTranslations("visits.delete");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const { items: visits, removeItem: handleDelete } = useOptimisticRemoveList({
    items: initialVisits,
    commitRemove: async (visit) => deleteVisitAction({ visitId: visit.id }),
    messages: {
      success: tDelete("success"),
      restored: tDelete("restored"),
      undo: tDelete("undo"),
      fallbackError: tCommon("error"),
    },
    onCommitSuccess: () => {
      router.refresh();
    },
  });

  if (visits.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-stone-200 bg-stone-50 px-5 py-8 text-center">
        <h3 className="text-sm font-semibold text-stone-900">
          {tEmpty("title")}
        </h3>
        <p className="mt-1 text-sm text-stone-600">{tEmpty("description")}</p>
      </div>
    );
  }

  return (
    <ul className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
      {visits.map((visit) => (
        <VisitRow
          key={visit.id}
          visit={visit}
          canManageVisits={canManageVisits}
          onDelete={handleDelete}
          today={today}
        />
      ))}
    </ul>
  );
}
