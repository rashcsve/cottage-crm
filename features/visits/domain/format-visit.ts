/**
 * Parse a visit's date-only range into structured values for display.
 * This module stays free of localized strings; components handle formatting.
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
 * Parse date range into structured values that UI components can format.
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
