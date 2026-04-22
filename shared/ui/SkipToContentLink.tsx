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
      className="sr-only fixed top-4 left-4 z-50 rounded-xl bg-stone-950 px-4 py-2 text-sm font-medium text-white shadow-lg focus:not-sr-only"
    >
      {label}
    </a>
  );
}
