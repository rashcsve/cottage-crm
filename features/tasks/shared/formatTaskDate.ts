import { parseDateOnlyUtc } from "@/lib/utils/date";

type TaskDateValue = string | Date;

const FORMATTER_CACHE = new Map<string, Intl.DateTimeFormat>();

const DUE_DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
};

function getFormatter(locale: string): Intl.DateTimeFormat {
  const cachedFormatter = FORMATTER_CACHE.get(locale);

  if (cachedFormatter) {
    return cachedFormatter;
  }

  const formatter = new Intl.DateTimeFormat(locale, DUE_DATE_OPTIONS);
  FORMATTER_CACHE.set(locale, formatter);

  return formatter;
}

export function formatTaskDueDate(value: TaskDateValue, locale: string) {
  const date = value instanceof Date ? value : parseDateOnlyUtc(value);

  return getFormatter(locale).format(date);
}
