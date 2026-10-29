import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { useTranslations } from "next-intl";
import csMessages from "@/i18n/locales/cs.json";
import enMessages from "@/i18n/locales/en.json";
import { ShoppingHeaderSummary } from "./ShoppingHeaderSummary";

vi.mock("next-intl", async (importOriginal) => ({
  ...(await importOriginal<typeof import("next-intl")>()),
  useTranslations: vi.fn(),
}));

const mockUseTranslations = vi.mocked(useTranslations);

async function useLocaleMessages(locale: "cs" | "en") {
  const { createTranslator } =
    await vi.importActual<typeof import("next-intl")>("next-intl");
  const messages = locale === "cs" ? csMessages : enMessages;

  mockUseTranslations.mockImplementation(
    (namespace?: string) =>
      createTranslator({
        locale,
        messages,
        namespace: namespace as "shopping",
      }) as unknown as ReturnType<typeof useTranslations>,
  );
}

describe("ShoppingHeaderSummary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each([
    { locale: "en" as const, pendingCount: 5, addedTodayCount: 2, text: "5 to buy · 2 added today" },
    { locale: "en" as const, pendingCount: 1, addedTodayCount: 1, text: "1 to buy · 1 added today" },
    { locale: "en" as const, pendingCount: 5, addedTodayCount: 0, text: "5 to buy" },
    { locale: "en" as const, pendingCount: 0, addedTodayCount: 0, text: "Nothing to buy" },
    { locale: "cs" as const, pendingCount: 5, addedTodayCount: 2, text: "5 koupit · 2 přidané dnes" },
    { locale: "cs" as const, pendingCount: 1, addedTodayCount: 1, text: "1 koupit · 1 přidaná dnes" },
    { locale: "cs" as const, pendingCount: 7, addedTodayCount: 5, text: "7 koupit · 5 přidaných dnes" },
    { locale: "cs" as const, pendingCount: 3, addedTodayCount: 0, text: "3 koupit" },
    { locale: "cs" as const, pendingCount: 0, addedTodayCount: 0, text: "Není co dokoupit" },
  ])(
    "shows “$text” for $pendingCount to buy and $addedTodayCount added today ($locale)",
    async ({ locale, pendingCount, addedTodayCount, text }) => {
      await useLocaleMessages(locale);

      const { container } = render(
        <ShoppingHeaderSummary
          pendingCount={pendingCount}
          addedTodayCount={addedTodayCount}
        />,
      );

      expect(container).toHaveTextContent(new RegExp(`^${text}$`));
      expect(screen.queryByRole("heading")).not.toBeInTheDocument();
    },
  );
});
