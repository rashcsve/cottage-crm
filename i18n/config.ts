import { getRequestConfig } from "next-intl/server";

export const SUPPORTED_LOCALES = ["cs", "en"] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: SupportedLocale = "cs";

function isSupportedLocale(locale: string): locale is SupportedLocale {
  return SUPPORTED_LOCALES.includes(locale as SupportedLocale);
}

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await requestLocale;
  console.log(locale);

  const selectedLocale =
    locale && isSupportedLocale(locale) ? locale : DEFAULT_LOCALE;
  console.log(selectedLocale);

  const messages = (await import(`./locales/${selectedLocale}.json`)).default;

  return {
    locale: selectedLocale,
    messages,
  };
});
