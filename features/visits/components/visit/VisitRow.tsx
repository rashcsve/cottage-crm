"use client";

import { useTranslations } from "next-intl";
import { VisitActions } from "./VisitActions";
import type { Visit } from "../../types/visits";
import { VisitDetails } from "./VisitDetails";

interface VisitRowProps {
  visit: Visit;
  canManageVisits: boolean;
  onDelete?: (visit: Visit) => void;
}

export function VisitRow({ visit, canManageVisits, onDelete }: VisitRowProps) {
  const tVisit = useTranslations("visits");
  const canShowActions = canManageVisits && onDelete;

  return (
    <li className="border-b border-stone-200 last:border-b-0">
      <div className="flex gap-3 px-4 py-4 sm:px-5">
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <VisitDetails visit={visit} titleTag="h4" />

            {canShowActions && (
              <div className="flex items-start self-start">
                <VisitActions
                  visit={visit}
                  onDelete={onDelete}
                  deleteAriaLabel={tVisit("aria.deleteVisitFor", {
                    visitorName: visit.visitorName,
                  })}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </li>
  );
}
