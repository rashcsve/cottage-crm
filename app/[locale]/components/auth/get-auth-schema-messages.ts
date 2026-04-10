type Translator = (key: string) => string;

export function getLoginSchemaMessages(t: Translator) {
  return {
    emailRequired: t("errors.emailRequired"),
    emailInvalid: t("errors.emailInvalid"),
    passwordRequired: t("errors.passwordRequired"),
  };
}

export function getSignupSchemaMessages(t: Translator) {
  return {
    displayNameRequired: t("errors.displayNameRequired"),
    displayNameMin: t("errors.displayNameMin"),
    displayNameMax: t("errors.displayNameMax"),
    emailRequired: t("errors.emailRequired"),
    emailInvalid: t("errors.emailInvalid"),
    passwordRequired: t("errors.passwordRequired"),
    passwordMin: t("errors.passwordMin"),
  };
}
