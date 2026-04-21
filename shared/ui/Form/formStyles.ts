export const formInputClass = (hasError: boolean): string => {
  const baseStyles =
    "min-h-11 w-full rounded-xl border px-3.5 py-2.5 text-[15px] leading-6 outline-none transition placeholder:text-stone-400 disabled:cursor-not-allowed disabled:bg-stone-100 disabled:text-stone-500";
  const errorStyles = hasError
    ? "border-red-300 bg-red-50 text-red-900 focus-visible:border-red-500 focus-visible:ring-2 focus-visible:ring-red-200"
    : "border-stone-300 bg-white text-stone-900 focus-visible:border-stone-500 focus-visible:ring-2 focus-visible:ring-stone-200";

  return `${baseStyles} ${errorStyles}`;
};
