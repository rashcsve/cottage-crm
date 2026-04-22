import { parseDateOnlyUtc } from "@/lib/utils/date";

type TaskDateValue = string | Date;

const FORMATTER_CACHE = new Map<string, Intl.DateTimeFormat>();

const DUE_DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
};

const TIMESTAMP_OPTIONS: Intl.DateTimeFormatOptions = {
  dateStyle: "medium",
  timeStyle: "short",
};

function getFormatter(
  locale: string,
  key: "dueDate" | "timestamp",
): Intl.DateTimeFormat {
  const cacheKey = `${locale}:${key}`;
  const cachedFormatter = FORMATTER_CACHE.get(cacheKey);

  if (cachedFormatter) {
    return cachedFormatter;
  }

  const formatter = new Intl.DateTimeFormat(
    locale,
    key === "dueDate" ? DUE_DATE_OPTIONS : TIMESTAMP_OPTIONS,
  );

  FORMATTER_CACHE.set(cacheKey, formatter);

  return formatter;
}

function toTaskDate(value: TaskDateValue, kind: "dueDate" | "timestamp") {
  if (value instanceof Date) {
    return value;
  }

  return kind === "dueDate" ? parseDateOnlyUtc(value) : new Date(value);
}

export function formatTaskDueDate(value: TaskDateValue, locale: string) {
  return getFormatter(locale, "dueDate").format(toTaskDate(value, "dueDate"));
}

export function formatTaskTimestamp(value: TaskDateValue, locale: string) {
  const date = toTaskDate(value, "timestamp");

  if (Number.isNaN(date.getTime())) {
    return typeof value === "string" ? value : "";
  }

  return getFormatter(locale, "timestamp").format(date);
}
