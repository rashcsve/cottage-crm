import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { useTranslations } from "next-intl";
import csMessages from "@/i18n/locales/cs.json";
import enMessages from "@/i18n/locales/en.json";
import { NotesHeaderSummary } from "./NotesHeaderSummary";

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
        namespace: namespace as "notes",
      }) as unknown as ReturnType<typeof useTranslations>,
  );
}

describe("NotesHeaderSummary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each([
    { locale: "en" as const, totalCount: 24, thisWeekCount: 3, text: "24 notes · 3 this week" },
    { locale: "en" as const, totalCount: 1, thisWeekCount: 1, text: "1 note · 1 this week" },
    { locale: "en" as const, totalCount: 5, thisWeekCount: 0, text: "5 notes" },
    { locale: "en" as const, totalCount: 0, thisWeekCount: 0, text: "No notes yet" },
    { locale: "cs" as const, totalCount: 1, thisWeekCount: 0, text: "1 poznámka" },
    { locale: "cs" as const, totalCount: 3, thisWeekCount: 2, text: "3 poznámky · 2 tento týden" },
    { locale: "cs" as const, totalCount: 24, thisWeekCount: 3, text: "24 poznámek · 3 tento týden" },
    { locale: "cs" as const, totalCount: 0, thisWeekCount: 0, text: "Zatím žádné poznámky" },
  ])(
    "shows “$text” for $totalCount notes and $thisWeekCount this week ($locale)",
    async ({ locale, totalCount, thisWeekCount, text }) => {
      await useLocaleMessages(locale);

      const { container } = render(
        <NotesHeaderSummary totalCount={totalCount} thisWeekCount={thisWeekCount} />,
      );

      expect(screen.getByText(text)).toBeInTheDocument();
      expect(container).toHaveTextContent(new RegExp(`^${text}$`));
    },
  );
});
