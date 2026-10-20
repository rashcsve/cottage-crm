interface SkipToContentLinkProps {
  label: string;
  targetId: string;
}

export function SkipToContentLink({
  label,
  targetId,
}: SkipToContentLinkProps) {
  return (
    <a
      href={`#${targetId}`}
      className="sr-only fixed top-4 left-4 z-50 rounded-control bg-ink-primary px-4 py-2.5 text-sm font-medium text-on-accent focus:not-sr-only"
    >
      {label}
    </a>
  );
}
