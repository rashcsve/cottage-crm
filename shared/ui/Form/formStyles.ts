export const formInputClass = (hasError: boolean): string => {
  const baseStyles =
    "min-h-11 w-full rounded-xl border px-3.5 py-2.5 text-base leading-6 outline-none transition placeholder:text-ink-faint disabled:cursor-not-allowed disabled:bg-muted disabled:text-ink-muted sm:text-[15px]";
  const errorStyles = hasError
    ? "border-danger-300 bg-danger-50 text-danger-900 focus-visible:border-danger-500 focus-visible:ring-2 focus-visible:ring-danger-200"
    : "border-border-strong bg-surface text-ink focus-visible:border-ink-muted focus-visible:ring-2 focus-visible:ring-border";

  return `${baseStyles} ${errorStyles}`;
};
