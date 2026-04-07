import { getTranslations } from "next-intl/server";
import z from "zod";

/**
 * Maps Zod validation issues into a flat field-error record for form actions.
 *
 * Conventions:
 * - field path is built from the Zod issue path using dot notation
 * - translation lookup first tries `fieldErrors.{fieldPath}`
 * - if no field-specific key exists, it falls back to `fieldErrors.default`
 *
 * Example:
 * - issue.path = ["title"] -> "title"
 * - issue.path = ["address", "street"] -> "address.street"
 *
 * Returned shape is suitable for action results like:
 * `{ fieldErrors: { title: "Title is required" } }`
 */
export function mapZodIssuesToFieldErrors(
  issues: z.ZodError["issues"],
  t: Awaited<ReturnType<typeof getTranslations>>
): Record<string, string> {
  return Object.fromEntries(
    issues.map((issue) => {
      const fieldPath = issue.path
        .filter(
          (key): key is string | number =>
            typeof key === "string" || typeof key === "number"
        )
        .join(".");

      const fieldErrorKey = `fieldErrors.${fieldPath}`;
      const message = t.has(fieldErrorKey)
        ? t(fieldErrorKey)
        : t("fieldErrors.default", { field: fieldPath });

      return [fieldPath, message];
    })
  );
}
