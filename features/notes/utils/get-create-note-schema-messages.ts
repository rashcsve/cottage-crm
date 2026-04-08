export function getCreateNoteSchemaMessages(t: (key: string) => string) {
  return {
    contentRequired: t("fields.errors.required"),
    contentMax: t("fields.errors.max"),
  };
}
