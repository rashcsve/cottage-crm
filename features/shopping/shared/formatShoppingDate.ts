type ShoppingDateValue = string | Date;

const FORMATTER_CACHE = new Map<string, Intl.DateTimeFormat>();

const TIMESTAMP_OPTIONS: Intl.DateTimeFormatOptions = {
  dateStyle: "medium",
  timeStyle: "short",
};

function getTimestampFormatter(locale: string): Intl.DateTimeFormat {
  const cachedFormatter = FORMATTER_CACHE.get(locale);

  if (cachedFormatter) {
    return cachedFormatter;
  }

  const formatter = new Intl.DateTimeFormat(locale, TIMESTAMP_OPTIONS);
  FORMATTER_CACHE.set(locale, formatter);
  return formatter;
}

export function formatShoppingTimestamp(
  value: ShoppingDateValue,
  locale: string,
) {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return typeof value === "string" ? value : "";
  }

  return getTimestampFormatter(locale).format(date);
}
