import { revalidateLocalizedPath } from "@/i18n/revalidation";

const SHOPPING_PATH = "/shopping";

export function revalidateShoppingPaths(): void {
  revalidateLocalizedPath(SHOPPING_PATH);
}
