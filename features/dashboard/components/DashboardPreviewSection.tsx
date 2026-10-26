import { DashboardPreviewCards } from "@/features/dashboard/components/DashboardPreviewCards";
import type { DashboardBulkSectionData } from "@/features/dashboard/types/dashboard";

interface DashboardPreviewSectionProps {
  bulkPromise: Promise<DashboardBulkSectionData>;
  locale: string;
}

export async function DashboardPreviewSection({
  bulkPromise,
  locale,
}: DashboardPreviewSectionProps) {
  const bulk = await bulkPromise;

  return <DashboardPreviewCards data={bulk} locale={locale} />;
}
