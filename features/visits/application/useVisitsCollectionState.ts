"use client";

import { useMemo, useState } from "react";
import { useOptimisticRemoveList } from "@/shared/hooks/useOptimisticRemoveList";
import { calculateVisitStats, getVisitStatus } from "../domain/visit-status";
import { sortVisitsByRange } from "../domain/visits-calendar";
import { deleteVisitAction } from "../server/actions";
import type { Visit } from "../types/visits";

export interface VisitsCollectionMessages {
  success: string;
  restored: string;
  undo: string;
  fallbackError: string;
  retry?: string;
}

interface UseVisitsCollectionStateArgs {
  initialVisits: Visit[];
  todayIso: string;
  deleteMessages: VisitsCollectionMessages;
}

function mergeVisits(serverVisits: Visit[], localVisits: Visit[]) {
  if (localVisits.length === 0) {
    return serverVisits;
  }

  const mergedVisits = [...serverVisits];
  const seenIds = new Set(serverVisits.map((visit) => visit.id));

  for (const visit of localVisits) {
    if (seenIds.has(visit.id)) {
      continue;
    }

    seenIds.add(visit.id);
    mergedVisits.push(visit);
  }

  return mergedVisits;
}

// Owns collection reconciliation so calendar state can stay focused on navigation/composer.
export function useVisitsCollectionState({
  initialVisits,
  todayIso,
  deleteMessages,
}: UseVisitsCollectionStateArgs) {
  const [localCreatedVisits, setLocalCreatedVisits] = useState<Visit[]>([]);

  const allVisits = useMemo(
    () => {
      if (localCreatedVisits.length === 0) {
        return initialVisits;
      }

      const syncedVisitIds = new Set(initialVisits.map((visit) => visit.id));
      const pendingCreatedVisits = localCreatedVisits.filter(
        (visit) => !syncedVisitIds.has(visit.id),
      );

      return mergeVisits(initialVisits, pendingCreatedVisits);
    },
    [initialVisits, localCreatedVisits],
  );

  const { items: visits, removeItem: handleDelete } = useOptimisticRemoveList({
    items: allVisits,
    commitRemove: async (visit) => deleteVisitAction({ visitId: visit.id }),
    messages: deleteMessages,
    onCommitSuccess: async (visit) => {
      setLocalCreatedVisits((currentVisits) =>
        currentVisits.filter((currentVisit) => currentVisit.id !== visit.id),
      );
    },
  });

  const orderedVisits = useMemo(
    () =>
      [...visits]
        .sort(sortVisitsByRange)
        .map((v) => ({ ...v, status: getVisitStatus(v.dateFrom, v.dateTo, todayIso) })),
    [visits, todayIso],
  );
  const stats = useMemo(
    () => calculateVisitStats(orderedVisits),
    [orderedVisits],
  );

  function registerCreatedVisit(visit: Visit) {
    setLocalCreatedVisits((currentVisits) => [
      ...currentVisits.filter((currentVisit) => currentVisit.id !== visit.id),
      visit,
    ]);
  }

  return {
    orderedVisits,
    stats,
    handleDelete,
    registerCreatedVisit,
  };
}
