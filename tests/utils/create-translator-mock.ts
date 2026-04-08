export type TranslationValues = Record<string, unknown>;

export type TranslatorMock = ((
  key: string,
  values?: TranslationValues
) => string) & {
  has: (key: string) => boolean;
};

export function createTranslatorMock(): TranslatorMock {
  const t = ((key: string, values?: TranslationValues) => {
    if (key === "fieldErrors.default" && values?.field) {
      return `fieldErrors.default:${String(values.field)}`;
    }

    return key;
  }) as TranslatorMock;

  t.has = () => true;

  return t;
}
