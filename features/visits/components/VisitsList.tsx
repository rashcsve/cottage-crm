"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { VisitRow } from "./VisitRow";
import { deleteVisitAction } from "../server/actions";
import { useToast } from "@/shared/Toast/useToast";
import { TOAST_UNDO_WINDOW_MS } from "@/shared/Toast/constants";
import type { Visit } from "../types/visits";
import { useRouter } from "@/i18n/navigation";

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
  const { showToast, dismissToast, info, error } = useToast();

  const [visits, setVisits] = useState<Visit[]>(initialVisits);
  const pendingDeleteTimersRef = useRef<Map<Visit["id"], number>>(new Map());

  useEffect(() => {
    setVisits(initialVisits);
  }, [initialVisits]);

  const clearPendingDeleteTimer = useCallback((visitId: Visit["id"]) => {
    const timerId = pendingDeleteTimersRef.current.get(visitId);

    if (timerId === undefined) {
      return;
    }

    clearTimeout(timerId);
    pendingDeleteTimersRef.current.delete(visitId);
  }, []);

  const restoreVisit = useCallback(
    (visit: Visit) => {
      setVisits((prev) => {
        if (prev.some((item) => item.id === visit.id)) {
          return prev;
        }

        const originalIndex = initialVisits.findIndex(
          (item) => item.id === visit.id
        );

        if (originalIndex < 0 || originalIndex > prev.length) {
          return [...prev, visit];
        }

        const nextVisits = [...prev];
        nextVisits.splice(originalIndex, 0, visit);

        return nextVisits;
      });
    },
    [initialVisits]
  );

  const commitDelete = useCallback(
    async (visit: Visit, toastId: string) => {
      try {
        const result = await deleteVisitAction({ visitId: visit.id });

        dismissToast(toastId);

        if (!result.ok) {
          restoreVisit(visit);
          error(result.error || tCommon("error"));
          return;
        }

        router.refresh();
      } catch (err) {
        dismissToast(toastId);
        restoreVisit(visit);

        const message = err instanceof Error ? err.message : tCommon("error");
        error(message);
      } finally {
        clearPendingDeleteTimer(visit.id);
      }
    },
    [
      dismissToast,
      restoreVisit,
      error,
      router,
      tCommon,
      clearPendingDeleteTimer,
    ]
  );

  const handleDelete = useCallback(
    (visit: Visit) => {
      if (pendingDeleteTimersRef.current.has(visit.id)) {
        return;
      }

      setVisits((prev) => prev.filter((item) => item.id !== visit.id));

      let toastId = "";

      const handleUndo = () => {
        clearPendingDeleteTimer(visit.id);
        dismissToast(toastId);
        restoreVisit(visit);
        info(tDelete("restored"));
      };

      toastId = showToast(tDelete("success"), {
        type: "info",
        duration: TOAST_UNDO_WINDOW_MS,
        action: { label: tDelete("undo"), onClick: handleUndo },
      });

      const timerId = window.setTimeout(() => {
        void commitDelete(visit, toastId);
      }, TOAST_UNDO_WINDOW_MS);

      pendingDeleteTimersRef.current.set(visit.id, timerId);
    },
    [
      commitDelete,
      dismissToast,
      info,
      restoreVisit,
      showToast,
      tDelete,
      clearPendingDeleteTimer,
    ]
  );

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
