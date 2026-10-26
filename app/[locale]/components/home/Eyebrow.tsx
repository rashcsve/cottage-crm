interface EyebrowProps {
  children: string;
}

export function Eyebrow({ children }: EyebrowProps) {
  return (
    <p className="text-xs font-semibold text-ink-muted">
      {children}
    </p>
  );
}
