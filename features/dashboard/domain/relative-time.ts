const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;
const RELATIVE_DAY_LIMIT = 7;

export function formatRelativeTimestamp(
  value: string,
  now: Date,
  locale: string,
): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const elapsedMs = Math.max(0, now.getTime() - date.getTime());
  const relative = new Intl.RelativeTimeFormat(locale, {
    numeric: "auto",
    style: "short",
  });

  if (elapsedMs < MINUTE_MS) {
    return relative.format(0, "second");
  }

  if (elapsedMs < HOUR_MS) {
    return relative.format(-Math.floor(elapsedMs / MINUTE_MS), "minute");
  }

  if (elapsedMs < DAY_MS) {
    return relative.format(-Math.floor(elapsedMs / HOUR_MS), "hour");
  }

  const days = Math.floor(elapsedMs / DAY_MS);

  if (days < RELATIVE_DAY_LIMIT) {
    return relative.format(-days, "day");
  }

  const sameYear = date.getUTCFullYear() === now.getUTCFullYear();

  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: sameYear ? undefined : "numeric",
    timeZone: "UTC",
  }).format(date);
}
