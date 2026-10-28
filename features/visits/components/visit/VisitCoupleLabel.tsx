import { useTranslations } from "next-intl";
import { getCoupleColorClasses, getVisitCoupleLabel } from "../../domain/couples";
import type { Visit } from "../../types/visits";

interface VisitCoupleLabelProps {
  visit: Visit;
}

export function VisitCoupleLabel({ visit }: VisitCoupleLabelProps) {
  const tMeta = useTranslations("visits.meta");
  const label = getVisitCoupleLabel(visit, tMeta("noCouple"));

  if (!label) {
    return null;
  }

  return (
    <span className="inline-flex min-w-0 items-center gap-1.5 text-xs text-ink-secondary">
      <span
        aria-hidden="true"
        className={`size-2.5 shrink-0 rounded-full ${getCoupleColorClasses(visit.couple).swatch}`}
      />
      <span className="truncate">{label}</span>
    </span>
  );
}
