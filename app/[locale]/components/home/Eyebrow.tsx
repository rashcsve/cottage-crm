interface EyebrowProps {
  children: string;
}

export function Eyebrow({ children }: EyebrowProps) {
  return (
    <p className="font-mono text-xs uppercase tracking-[0.3em] text-ink-muted">
      {children}
    </p>
  );
}