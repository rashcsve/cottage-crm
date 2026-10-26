import { DEFAULT_LOCALE, isSupportedLocale } from "@/i18n/locales";
import { DEFAULT_AUTHENTICATED_ROUTE, publicRoutes } from "@/lib/routes";

const OAUTH_CALLBACK_PATH = "/auth/callback";
const OAUTH_ERROR_QUERY = "?error=oauth";

function getLocalePrefix(locale: string): string {
  const resolvedLocale = isSupportedLocale(locale) ? locale : DEFAULT_LOCALE;

  return resolvedLocale === DEFAULT_LOCALE ? "" : `/${resolvedLocale}`;
}

export function buildOAuthCallbackUrl(origin: string, locale: string): string {
  return new URL(
    `${getLocalePrefix(locale)}${OAUTH_CALLBACK_PATH}`,
    origin,
  ).toString();
}

export function buildPostLoginPath(locale: string): string {
  return `${getLocalePrefix(locale)}${DEFAULT_AUTHENTICATED_ROUTE}`;
}

export function buildLoginErrorPath(locale: string): string {
  return `${getLocalePrefix(locale)}${publicRoutes.login}${OAUTH_ERROR_QUERY}`;
}
