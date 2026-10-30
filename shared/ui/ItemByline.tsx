import {
  formatFullTimestamp,
  formatRelativeTimestamp,
} from "@/lib/utils/formatRelativeTimestamp";

interface RelativeTimeProps {
  dateTime: string;
  locale: string;
  now?: Date;
}

export function RelativeTime({ dateTime, locale, now }: RelativeTimeProps) {
  return (
    <time
      dateTime={dateTime}
      title={formatFullTimestamp(dateTime, locale)}
      className="font-mono"
      suppressHydrationWarning
    >
      {formatRelativeTimestamp(dateTime, locale, now)}
    </time>
  );
}

type ItemBylineSize = "default" | "compact";

const BYLINE_SIZE_CLASS: Record<ItemBylineSize, string> = {
  default: "text-xs",
  compact: "text-2xs sm:text-xs",
};

interface ItemBylineProps extends RelativeTimeProps {
  name?: string;
  label: string;
  size?: ItemBylineSize;
  className?: string;
}

export function ItemByline({
  name,
  label,
  dateTime,
  locale,
  now,
  size = "default",
  className = "",
}: ItemBylineProps) {
  return (
    <span
      className={`inline-flex flex-wrap items-center gap-x-1.5 ${BYLINE_SIZE_CLASS[size]} text-ink-secondary ${className}`.trim()}
    >
      <span className="sr-only">{label}</span>
      {name ? (
        <>
          <span aria-hidden="true">{name}</span>
          <span aria-hidden="true">·</span>
        </>
      ) : null}
      <RelativeTime dateTime={dateTime} locale={locale} now={now} />
    </span>
  );
}
