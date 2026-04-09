import type { CreateVisitSchemaMessages } from "../schemas";

export function getCreateVisitSchemaMessages(
  t: (key: string) => string
): CreateVisitSchemaMessages {
  return {
    visitorNameRequired: t("errors.visitorNameRequired"),
    visitorNameTooLong: t("errors.visitorNameTooLong"),
    dateFromInvalid: t("errors.dateFromInvalid"),
    dateToInvalid: t("errors.dateToInvalid"),
    noteTooLong: t("errors.noteTooLong"),
  };
}
