export function getCreateNoteSchemaMessages(t: (key: string) => string) {
  return {
    contentRequired: t("fields.errors.required"),
    contentMax: t("fields.errors.max"),
    photosTooMany: t("fields.errors.photosTooMany"),
    photoInvalidType: t("fields.errors.photoInvalidType"),
    photoTooLarge: t("fields.errors.photoTooLarge"),
  };
}
