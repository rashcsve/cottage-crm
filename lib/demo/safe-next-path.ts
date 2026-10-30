import { isSupportedLocale } from "@/i18n/locales";
import { dashboardRoutes } from "@/lib/routes";

const DASHBOARD_SEGMENTS: readonly string[] = Object.values(dashboardRoutes).map(
  (route) => route.slice(1),
);
const FORBIDDEN_CHARACTERS = ["\\", "#"];

function hasControlCharacter(value: string): boolean {
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);

    if (code <= 0x1f || code === 0x7f) {
      return true;
    }
  }

  return false;
}

function isDashboardPathname(pathname: string): boolean {
  if (pathname.includes("%")) {
    return false;
  }

  const segments = pathname.slice(1).split("/");

  if (segments.length > 1 && segments.at(-1) === "") {
    segments.pop();
  }

  if (segments.some((segment) => segment === "" || segment === "." || segment === "..")) {
    return false;
  }

  const [first, ...rest] = segments;
  const routeSegment = first !== undefined && isSupportedLocale(first) ? rest[0] : first;

  return routeSegment !== undefined && DASHBOARD_SEGMENTS.includes(routeSegment);
}

export function getSafeDashboardNextPath(next: string | null): string | null {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return null;
  }

  if (hasControlCharacter(next) || FORBIDDEN_CHARACTERS.some((char) => next.includes(char))) {
    return null;
  }

  const [pathname = ""] = next.split("?", 1);

  return isDashboardPathname(pathname) ? next : null;
}
