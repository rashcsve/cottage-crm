interface QuickAddPlaceholderProps {
  testId: string;
  withDetailsRow?: boolean;
  className?: string;
}

export function QuickAddPlaceholder({
  testId,
  withDetailsRow = false,
  className = "",
}: QuickAddPlaceholderProps) {
  return (
    <div
      aria-hidden="true"
      data-testid={testId}
      className={`space-y-3 ${className}`.trim()}
    >
      <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-2">
        <span className="mb-2 block text-sm font-semibold">&nbsp;</span>
        <div className="col-start-1 h-11 rounded-control border-control border-border bg-surface" />
        <div className="col-start-2 row-start-2 h-11 w-20 rounded-control bg-muted" />
      </div>
      {withDetailsRow ? <div className="h-11" /> : null}
    </div>
  );
}
