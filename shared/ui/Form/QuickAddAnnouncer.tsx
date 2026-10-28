import type { QuickAddAnnouncement } from "@/shared/hooks/useQuickAddSubmit";

interface QuickAddAnnouncerProps {
  announcement: QuickAddAnnouncement;
}

export function QuickAddAnnouncer({ announcement }: QuickAddAnnouncerProps) {
  return (
    <span className="sr-only" role="status">
      <span key={announcement.id}>{announcement.text}</span>
    </span>
  );
}
