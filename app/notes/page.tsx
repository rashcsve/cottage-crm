import { AppShell } from "@/components/AppShell";
import { SectionHeader } from "@/components/SectionHeader";

export default function NotesPage() {
  return (
    <AppShell title="Poznámky">
      <SectionHeader
        title="Poznámky a deník"
        description="Krátké záznamy o tom, co se na chatě dělo."
      />
    </AppShell>
  );
}
