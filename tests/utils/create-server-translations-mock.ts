import type { TranslationValues } from "@/tests/utils/create-translator-mock";

/**
 * Translator for `getTranslations(namespace)` mocks: returns
 * `namespace.key`, with interpolation values appended as JSON so tests can
 * assert both the key and the values passed to it.
 */
export function createNamespacedTranslatorMock(namespace: string) {
  return (key: string, values?: TranslationValues) =>
    values
      ? `${namespace}.${key} ${JSON.stringify(values)}`
      : `${namespace}.${key}`;
}
