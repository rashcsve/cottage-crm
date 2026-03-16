import { AppShell } from "@/components/AppShell";
import { SectionHeader } from "@/components/SectionHeader";

export default function ShoppingPage() {
  return (
    <AppShell title="Nákupní seznam">
      <SectionHeader
        title="Seznam nákupů"
        description="Věci, které je potřeba přivézt nebo dokoupit."
      />
    </AppShell>
  );
}
