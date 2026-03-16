import { AppShell } from "@/components/AppShell";
import { SectionHeader } from "@/components/SectionHeader";

export default function VisitsPage() {
  return (
    <AppShell title="Návštěvy">
      <SectionHeader
        title="Kalendář návštěv"
        description="Přehled, kdo na chatu jel nebo plánuje jet."
      />
    </AppShell>
  );
}
