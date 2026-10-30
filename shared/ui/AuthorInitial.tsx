const AVATAR_FALLBACK = "?";
const AVATAR_CLASS =
  "flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-ink-secondary";

function getAuthorInitial(author: string, locale: string): string {
  const [first] = new Intl.Segmenter(locale, { granularity: "grapheme" }).segment(
    author.trim().normalize("NFC"),
  );
  return first?.segment.toLocaleUpperCase(locale) ?? AVATAR_FALLBACK;
}

interface AuthorInitialProps {
  author: string;
  locale: string;
}

export function AuthorInitial({ author, locale }: AuthorInitialProps) {
  return (
    <span aria-hidden="true" className={AVATAR_CLASS}>
      {getAuthorInitial(author, locale)}
    </span>
  );
}
