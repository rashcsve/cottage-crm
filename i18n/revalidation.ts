import "server-only";

import { revalidatePath as nextRevalidatePath } from "next/cache";
import { getPathname } from "./navigation";
import { routing } from "./routing";

type LocalizedHref = Parameters<typeof getPathname>[0]["href"];

export function getLocalizedPathnames(href: LocalizedHref): string[] {
  const localizedPathnames = new Set<string>();

  for (const locale of routing.locales) {
    localizedPathnames.add(getPathname({ href, locale }));
  }

  return [...localizedPathnames];
}

export function revalidateLocalizedPath(href: LocalizedHref): void {
  for (const pathname of getLocalizedPathnames(href)) {
    nextRevalidatePath(pathname);
  }
}

export function revalidateLocalizedPaths(hrefs: LocalizedHref[]): void {
  for (const href of hrefs) {
    revalidateLocalizedPath(href);
  }
}
