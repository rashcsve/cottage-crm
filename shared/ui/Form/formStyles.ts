export const formInputClass = (hasError: boolean): string => {
  const baseStyles =
    "w-full rounded-md border px-3 py-2 text-sm outline-none transition disabled:bg-stone-100 disabled:text-stone-500";
  const errorStyles = hasError
    ? "border-red-300 bg-red-50 text-red-900 focus-visible:ring-2 focus-visible:ring-red-500"
    : "border-stone-300 bg-white text-stone-900 focus-visible:ring-2 focus-visible:ring-stone-500";

  return `${baseStyles} ${errorStyles}`;
};
