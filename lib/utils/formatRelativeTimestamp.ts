import { formatInTimeZone } from "date-fns-tz";
import { diffDateOnlyInDays } from "@/lib/utils/date";

type TimestampValue = string | Date;

const TIME_ZONE = "Europe/Prague";
const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;
const RELATIVE_LIMIT_DAYS = 7;

const TIMESTAMP_OPTIONS: Intl.DateTimeFormatOptions = {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: TIME_ZONE,
};

const TIMESTAMP_FORMATTER_CACHE = new Map<string, Intl.DateTimeFormat>();
const RELATIVE_FORMATTER_CACHE = new Map<string, Intl.RelativeTimeFormat>();

function getTimestampFormatter(locale: string): Intl.DateTimeFormat {
  const cachedFormatter = TIMESTAMP_FORMATTER_CACHE.get(locale);

  if (cachedFormatter) {
    return cachedFormatter;
  }

  const formatter = new Intl.DateTimeFormat(locale, TIMESTAMP_OPTIONS);
  TIMESTAMP_FORMATTER_CACHE.set(locale, formatter);
  return formatter;
}

function getRelativeFormatter(locale: string): Intl.RelativeTimeFormat {
  const cachedFormatter = RELATIVE_FORMATTER_CACHE.get(locale);

  if (cachedFormatter) {
    return cachedFormatter;
  }

  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  RELATIVE_FORMATTER_CACHE.set(locale, formatter);
  return formatter;
}

function toDate(value: TimestampValue): Date | null {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function toFallback(value: TimestampValue): string {
  return typeof value === "string" ? value : "";
}

export function formatFullTimestamp(
  value: TimestampValue,
  locale: string,
): string {
  const date = toDate(value);

  if (!date) {
    return toFallback(value);
  }

  return getTimestampFormatter(locale).format(date);
}

export function formatRelativeTimestamp(
  value: TimestampValue,
  locale: string,
  now: Date = new Date(),
): string {
  const date = toDate(value);

  if (!date) {
    return toFallback(value);
  }

  const elapsedMs = Math.max(0, now.getTime() - date.getTime());
  const formatter = getRelativeFormatter(locale);

  if (elapsedMs < MINUTE_MS) {
    return formatter.format(0, "second");
  }

  if (elapsedMs < HOUR_MS) {
    return formatter.format(-Math.floor(elapsedMs / MINUTE_MS), "minute");
  }

  if (elapsedMs < DAY_MS) {
    return formatter.format(-Math.floor(elapsedMs / HOUR_MS), "hour");
  }

  const elapsedDays = diffDateOnlyInDays(
    formatInTimeZone(date, TIME_ZONE, "yyyy-MM-dd"),
    formatInTimeZone(now, TIME_ZONE, "yyyy-MM-dd"),
  );

  if (elapsedDays < RELATIVE_LIMIT_DAYS) {
    return formatter.format(-elapsedDays, "day");
  }

  return getTimestampFormatter(locale).format(date);
}
