import { getTranslations } from "next-intl/server";
import z from "zod";

// Looks up `fieldErrors.{fieldPath}` in the action's translation namespace, falls back to `fieldErrors.default`
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
