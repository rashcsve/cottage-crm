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
    <li className="flex min-h-12 items-start gap-3 px-4 py-3 sm:px-5">
      <div className="min-w-0 flex-1">
        <VisitDetails visit={visit} titleTag="h4" />
      </div>

      {canShowActions && (
        <div className="shrink-0 self-start">
          <VisitActions
            visit={visit}
            onDelete={onDelete}
            deleteAriaLabel={tVisit("aria.deleteVisitFor", {
              visitorName: visit.visitorName,
            })}
          />
        </div>
      )}
    </li>
  );
}
