import { getRequestConfig } from "next-intl/server";
import {
  DEFAULT_LOCALE,
  isSupportedLocale,
} from "@/i18n/locales";

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await requestLocale;

  const selectedLocale =
    locale && isSupportedLocale(locale) ? locale : DEFAULT_LOCALE;

  const messages = (await import(`./locales/${selectedLocale}.json`)).default;

  return {
    locale: selectedLocale,
    messages,
  };
});
