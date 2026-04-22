import { describe, expect, it } from "vitest";

import csMessages from "@/i18n/locales/cs.json";
import enMessages from "@/i18n/locales/en.json";

function getLeafKeys(
  value: Record<string, unknown>,
  prefix = "",
): string[] {
  return Object.entries(value).flatMap(([key, nestedValue]) => {
    const nextPrefix = prefix ? `${prefix}.${key}` : key;

    if (
      nestedValue &&
      typeof nestedValue === "object" &&
      !Array.isArray(nestedValue)
    ) {
      return getLeafKeys(nestedValue as Record<string, unknown>, nextPrefix);
    }

    return nextPrefix;
  });
}

describe("locale messages", () => {
  it("keeps Czech and English translation keys in sync", () => {
    expect(getLeafKeys(enMessages).sort()).toEqual(
      getLeafKeys(csMessages).sort(),
    );
  });
});
