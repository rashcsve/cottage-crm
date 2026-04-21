import type { CreateVisitSchemaMessages } from "./index";

export function getCreateVisitSchemaMessages(
  t: (key: string) => string,
): CreateVisitSchemaMessages {
  return {
    visitorNameRequired: t("errors.visitorNameRequired"),
    visitorNameTooLong: t("errors.visitorNameTooLong"),
    dateFromInvalid: t("errors.dateFromInvalid"),
    dateToInvalid: t("errors.dateToInvalid"),
    dateRangeInvalid: t("errors.dateFromAfterDateTo"),
    noteTooLong: t("errors.noteTooLong"),
  };
}
