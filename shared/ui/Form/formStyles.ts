export const formInputClass = (hasError: boolean): string => {
  const baseStyles =
    "min-h-11 w-full min-w-0 rounded-control border-control bg-surface px-3.5 py-2.5 text-base leading-6 text-ink-primary transition-colors placeholder:text-ink-muted focus-visible:outline-offset-0 disabled:cursor-not-allowed disabled:border-border disabled:bg-muted disabled:text-ink-muted";
  const borderStyles = hasError ? "border-danger" : "border-ink-primary";

  return `${baseStyles} ${borderStyles}`;
};
