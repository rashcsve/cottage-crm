import { format, parse } from "date-fns";
import { cs, enUS } from "date-fns/locale";
import type { Locale } from "date-fns";

/**
 * Converts a Date into a local calendar-day string: YYYY-MM-DD.
 */
export function toDateOnlyString(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

/**
 * Checks whether a date-only string is before the reference calendar day.
 * Safe for YYYY-MM-DD values.
 */
export function isDateOnlyBefore(value: string, referenceDate: Date): boolean {
  return value < toDateOnlyString(referenceDate);
}

/**
 * Checks whether a date-only string matches the reference calendar day.
 * Safe for YYYY-MM-DD values.
 */
export function isSameDateOnly(value: string, referenceDate: Date): boolean {
  return value === toDateOnlyString(referenceDate);
}

/**
 * Formats a YYYY-MM-DD date-only string for display.
 *
 * We parse it as a calendar date, not a timestamp, to avoid timezone shift bugs.
 */
export function formatDateOnly(
  value: string,
  locale: string,
  pattern = "d.M"
): string {
  const parsed = parse(value, "yyyy-MM-dd", new Date());

  return format(parsed, pattern, {
    locale: getDateFnsLocale(locale),
  });
}

function getDateFnsLocale(locale: string): Locale {
  const localeMap: Record<string, Locale> = {
    en: enUS,
    "en-US": enUS,
    cs,
    "cs-CZ": cs,
  };

  return localeMap[locale] ?? enUS;
}
