type Translator = (key: string) => string;

export function getCreateTaskSchemaMessages(t: Translator) {
  return {
    titleRequired: t("errors.titleRequired"),
    titleMin: t("errors.titleMinLength"),
    titleMax: t("errors.titleMaxLength"),
    descriptionMax: t("errors.descriptionMaxLength"),
    invalidDate: t("errors.invalidDate"),
  };
}
