type ShoppingDateValue = string | Date;

const FORMATTER_CACHE = new Map<string, Intl.DateTimeFormat>();

const TIMESTAMP_OPTIONS: Intl.DateTimeFormatOptions = {
  dateStyle: "medium",
  timeStyle: "short",
};

const SHORT_DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "numeric",
};

const SHORT_DATE_WITH_YEAR_OPTIONS: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "numeric",
  year: "numeric",
};

function getFormatter(
  key: string,
  locale: string,
  options: Intl.DateTimeFormatOptions,
): Intl.DateTimeFormat {
  const cacheKey = `${key}:${locale}`;
  const cachedFormatter = FORMATTER_CACHE.get(cacheKey);

  if (cachedFormatter) {
    return cachedFormatter;
  }

  const formatter = new Intl.DateTimeFormat(locale, options);
  FORMATTER_CACHE.set(cacheKey, formatter);
  return formatter;
}

function toDate(value: ShoppingDateValue): Date | null {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function toFallback(value: ShoppingDateValue): string {
  return typeof value === "string" ? value : "";
}

export function formatShoppingTimestamp(
  value: ShoppingDateValue,
  locale: string,
) {
  const date = toDate(value);

  if (!date) {
    return toFallback(value);
  }

  return getFormatter("timestamp", locale, TIMESTAMP_OPTIONS).format(date);
}

export function formatShoppingShortDate(
  value: ShoppingDateValue,
  locale: string,
  now: Date = new Date(),
) {
  const date = toDate(value);

  if (!date) {
    return toFallback(value);
  }

  return date.getFullYear() === now.getFullYear()
    ? getFormatter("short", locale, SHORT_DATE_OPTIONS).format(date)
    : getFormatter("shortWithYear", locale, SHORT_DATE_WITH_YEAR_OPTIONS).format(
        date,
      );
}
