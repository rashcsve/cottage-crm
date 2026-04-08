import { createNavigation } from "next-intl/navigation";
import { revalidatePath as nextRevalidatePath } from "next/cache";
import { routing } from "./routing";

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);

export function revalidateLocalizedPath(locale: string, path: string) {
  nextRevalidatePath(`/${locale}${path}`);
}
