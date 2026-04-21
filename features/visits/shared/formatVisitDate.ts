import { parseDateOnlyUtc } from "@/lib/utils/date";

type VisitDateValue = string | Date;
type VisitDateFormatKey =
  | "full"
  | "compact"
  | "range"
  | "dayNumber"
  | "monthLabel"
  | "weekRange"
  | "compactRangeDay"
  | "compactRangeMonth"
  | "compactRangeFull";

const FORMATTER_CACHE = new Map<string, Intl.DateTimeFormat>();
const RANGE_SEPARATOR = " – ";

const VISIT_DATE_FORMAT_OPTIONS: Record<
  VisitDateFormatKey,
  Intl.DateTimeFormatOptions
> = {
  full: {
    dateStyle: "full",
    timeZone: "UTC",
  },
  compact: {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  },
  range: {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  },
  dayNumber: {
    day: "numeric",
    timeZone: "UTC",
  },
  monthLabel: {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  },
  weekRange: {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  },
  compactRangeDay: {
    day: "numeric",
    timeZone: "UTC",
  },
  compactRangeMonth: {
    day: "numeric",
    month: "numeric",
    timeZone: "UTC",
  },
  compactRangeFull: {
    day: "numeric",
    month: "numeric",
    year: "numeric",
    timeZone: "UTC",
  },
};

function getFormatter(locale: string, formatKey: VisitDateFormatKey) {
  const cacheKey = `${locale}:${formatKey}`;
  const cachedFormatter = FORMATTER_CACHE.get(cacheKey);

  if (cachedFormatter) {
    return cachedFormatter;
  }

  const formatter = new Intl.DateTimeFormat(
    locale,
    VISIT_DATE_FORMAT_OPTIONS[formatKey]
  );

  FORMATTER_CACHE.set(cacheKey, formatter);

  return formatter;
}

function toVisitDate(value: VisitDateValue) {
  return typeof value === "string" ? parseDateOnlyUtc(value) : value;
}

function joinVisitDateRange(startLabel: string, endLabel: string) {
  if (startLabel === endLabel) {
    return startLabel;
  }

  return `${startLabel}${RANGE_SEPARATOR}${endLabel}`;
}

function normalizeVisitRangeSeparator(value: string) {
  return value.replace(/\s*[–-]\s*/u, RANGE_SEPARATOR);
}

type VisitRangeFormatter = Intl.DateTimeFormat & {
  formatRange?: (startDate: Date, endDate: Date) => string;
  formatRangeToParts?: (
    startDate: Date,
    endDate: Date
  ) => Intl.DateTimeRangeFormatPart[];
};

/**
 * Visits are modeled as UTC-normalized date-only values. These formatters keep
 * every display surface aligned with that model and avoid local-time drift.
 */
export function formatVisitFullDate(value: VisitDateValue, locale: string) {
  return getFormatter(locale, "full").format(toVisitDate(value));
}

export function formatVisitCompactDate(value: VisitDateValue, locale: string) {
  return getFormatter(locale, "compact").format(toVisitDate(value));
}

export function formatVisitDayNumber(value: VisitDateValue, locale: string) {
  return getFormatter(locale, "dayNumber").format(toVisitDate(value));
}

export function formatVisitMonthLabel(value: VisitDateValue, locale: string) {
  return getFormatter(locale, "monthLabel").format(toVisitDate(value));
}

export function formatVisitWeekRangeLabel(
  start: VisitDateValue,
  end: VisitDateValue,
  locale: string
) {
  const startDate = toVisitDate(start);
  const endDate = toVisitDate(end);
  const formatter = getFormatter(locale, "weekRange") as VisitRangeFormatter;

  if (formatter.formatRangeToParts) {
    return formatter
      .formatRangeToParts(startDate, endDate)
      .map((part) =>
        part.type === "literal" && /[–-]/u.test(part.value)
          ? RANGE_SEPARATOR
          : part.value
      )
      .join("");
  }

  if (formatter.formatRange) {
    return normalizeVisitRangeSeparator(
      formatter.formatRange(startDate, endDate)
    );
  }

  return joinVisitDateRange(
    formatter.format(startDate),
    formatter.format(endDate)
  );
}

export function formatVisitDateRangeLabel(
  dateFrom: string,
  dateTo: string,
  locale: string
) {
  const formatter = getFormatter(locale, "range");
  const fromLabel = formatter.format(toVisitDate(dateFrom));

  return joinVisitDateRange(fromLabel, formatter.format(toVisitDate(dateTo)));
}

export function formatVisitCompactDateRangeLabel(
  dateFrom: string,
  dateTo: string,
  locale: string
) {
  const startDate = toVisitDate(dateFrom);
  const endDate = toVisitDate(dateTo);

  const sameYear = startDate.getUTCFullYear() === endDate.getUTCFullYear();
  const sameDay = startDate.getTime() === endDate.getTime();

  const monthFormatter = getFormatter(locale, "compactRangeMonth");
  const fullFormatter = getFormatter(locale, "compactRangeFull");

  if (sameDay) {
    return monthFormatter.format(startDate);
  }

  if (sameYear) {
    return joinVisitDateRange(
      monthFormatter.format(startDate),
      monthFormatter.format(endDate)
    );
  }

  return joinVisitDateRange(
    fullFormatter.format(startDate),
    fullFormatter.format(endDate)
  );
}
