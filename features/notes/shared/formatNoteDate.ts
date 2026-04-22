type NoteDateValue = string | Date;

const NOTE_TIMESTAMP_CACHE = new Map<string, Intl.DateTimeFormat>();
const NOTE_TIMESTAMP_OPTIONS: Intl.DateTimeFormatOptions = {
  dateStyle: "medium",
  timeStyle: "short",
};

function getFormatter(locale: string) {
  const cachedFormatter = NOTE_TIMESTAMP_CACHE.get(locale);

  if (cachedFormatter) {
    return cachedFormatter;
  }

  const formatter = new Intl.DateTimeFormat(locale, NOTE_TIMESTAMP_OPTIONS);
  NOTE_TIMESTAMP_CACHE.set(locale, formatter);

  return formatter;
}

function toNoteDate(value: NoteDateValue) {
  return value instanceof Date ? value : new Date(value);
}

export function formatNoteTimestamp(value: NoteDateValue, locale: string) {
  const date = toNoteDate(value);

  if (Number.isNaN(date.getTime())) {
    return typeof value === "string" ? value : "";
  }

  return getFormatter(locale).format(date);
}
