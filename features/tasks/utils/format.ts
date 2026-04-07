/**
 * Formats a date for display in the UI.
 * Uses locale-specific number formatting (no month names).
 *
 * Example: "15.1" (Czech) or "1/15" (US)
 *
 * @param dateString ISO date string
 * @param locale BCP 47 locale tag
 * @returns Formatted date string
 */
export function formatTaskDate(dateString: string, locale: string): string {
  try {
    return new Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: "numeric",
    }).format(new Date(dateString));
  } catch (error) {
    console.error(`Failed to format date: ${dateString}`, error);
    return dateString; // Fallback
  }
}
