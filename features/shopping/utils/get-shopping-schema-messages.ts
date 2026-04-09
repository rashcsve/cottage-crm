export function getShoppingSchemaMessages(
  t: (key: string) => string
): Record<string, string> {
  return {
    titleRequired: t("errors.titleRequired"),
    titleMaxLength: t("errors.titleMaxLength"),
  };
}
