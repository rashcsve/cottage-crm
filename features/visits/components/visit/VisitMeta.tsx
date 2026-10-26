import type { Visit } from "../../types/visits";

interface VisitMetaProps {
  visit: Visit;
  addedByLabel: string;
  compact?: boolean;
}

export function VisitMeta({
  visit,
  addedByLabel,
  compact = false,
}: VisitMetaProps) {
  if (compact) {
    return (
      <div className="min-w-0 space-y-0.5" title={`${addedByLabel}: ${visit.author}`}>
        <p className="text-xs text-ink-muted">{addedByLabel}</p>
        <p className="wrap-break-word text-xs font-medium text-ink-secondary">
          {visit.author}
        </p>
      </div>
    );
  }

  return (
    <p
      className="text-xs text-ink-muted"
      title={`${addedByLabel}: ${visit.author}`}
    >
      {addedByLabel}: {visit.author}
    </p>
  );
}
