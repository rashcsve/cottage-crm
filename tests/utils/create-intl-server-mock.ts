import { vi } from "vitest";
import type { NamespaceKeys, NestedKeyOf } from "next-intl";

import cs from "@/i18n/locales/cs.json";
import en from "@/i18n/locales/en.json";

type Messages = typeof en;
type Namespace = NamespaceKeys<Messages, NestedKeyOf<Messages>>;

export type TestLocale = "cs" | "en";

const messagesByLocale: Record<TestLocale, Messages> = { cs, en };

export async function createIntlServerMock(getLocale: () => TestLocale) {
  const { createTranslator } =
    await vi.importActual<typeof import("next-intl")>("next-intl");

  return {
    getTranslations: async (
      input: Namespace | { locale?: string; namespace: Namespace },
    ) => {
      const namespace = typeof input === "string" ? input : input.namespace;
      const locale = getLocale();

      return createTranslator({
        locale,
        messages: messagesByLocale[locale],
        namespace,
      });
    },
  };
}
