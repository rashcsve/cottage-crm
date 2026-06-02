import { format, parse } from "date-fns";
import { cs, enUS } from "date-fns/locale";
import type { Locale } from "date-fns";

const DAY_MS = 24 * 60 * 60 * 1000;
const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function toDateOnlyString(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function isDateOnlyBefore(value: string, referenceDate: Date): boolean {
  return value < toDateOnlyString(referenceDate);
}

export function isSameDateOnly(value: string, referenceDate: Date): boolean {
  return value === toDateOnlyString(referenceDate);
}

export function isDateOnlyString(value: string): boolean {
  return DATE_ONLY_PATTERN.test(value);
}

export function parseDateOnlyUtc(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);

  return new Date(Date.UTC(year, month - 1, day));
}

export function formatDateOnlyUtc(date: Date): string {
  return toDateOnlyString(date);
}

export function addDaysUtc(date: Date, amount: number): Date {
  return new Date(date.getTime() + amount * DAY_MS);
}

export function compareDateOnly(left: string, right: string): number {
  return left.localeCompare(right);
}

export function diffDateOnlyInDays(startIso: string, endIso: string): number {
  const start = parseDateOnlyUtc(startIso);
  const end = parseDateOnlyUtc(endIso);

  return Math.round((end.getTime() - start.getTime()) / DAY_MS);
}

// Parses as a calendar date (not a timestamp) to avoid timezone shift bugs.
export function formatDateOnly(
  value: string,
  locale: string,
  pattern = "d.M"
): string {
  try {
    const parsed = parse(value, "yyyy-MM-dd", new Date());
    return format(parsed, pattern, {
      locale: getDateFnsLocale(locale),
    });
  } catch {
    return value;
  }
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
