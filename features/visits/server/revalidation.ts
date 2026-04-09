import { revalidateLocalizedPath } from "@/i18n/revalidation";

const VISITS_PATH = "/visits";

export function revalidateVisitPaths(): void {
  revalidateLocalizedPath(VISITS_PATH);
}
