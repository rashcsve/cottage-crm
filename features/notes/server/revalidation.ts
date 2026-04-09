import { revalidateLocalizedPath } from "@/i18n/revalidation";

const NOTES_PATH = "/notes";

export function revalidateNotePaths(): void {
  revalidateLocalizedPath(NOTES_PATH);
}
