import { AppShell } from "@/app/components/AppShell";
import { SectionHeader } from "@/app/components/SectionHeader";

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
