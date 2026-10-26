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
      <p
        className="min-w-0 wrap-break-word text-xs text-ink-secondary"
        title={`${addedByLabel}: ${visit.author}`}
      >
        <span>{addedByLabel}</span>{" "}
        <span>{visit.author}</span>
      </p>
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
