/**
 * Pure formatting: NO strings, NO i18n.
 * Returns structured data; localization happens in components via i18n.
 */

function parseDateOnly(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

interface FormattedDateRange {
  from: Date;
  to: Date;
  isSameDay: boolean;
}

/**
 * Parse date range into structured format.
 * Component receives this and calls i18n for formatting.
 */
export function parseVisitDateRange(
  dateFrom: string,
  dateTo: string
): FormattedDateRange {
  return {
    from: parseDateOnly(dateFrom),
    to: parseDateOnly(dateTo),
    isSameDay: dateFrom === dateTo,
  };
}
