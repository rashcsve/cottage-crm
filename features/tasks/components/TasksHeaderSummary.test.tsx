import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { useTranslations } from "next-intl";
import csMessages from "@/i18n/locales/cs.json";
import enMessages from "@/i18n/locales/en.json";
import { TasksHeaderSummary } from "./TasksHeaderSummary";

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
        namespace: namespace as "tasks",
      }) as unknown as ReturnType<typeof useTranslations>,
  );
}

describe("TasksHeaderSummary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each([
    { locale: "en" as const, openCount: 5, overdueCount: 2, text: "5 open · 2 overdue" },
    { locale: "en" as const, openCount: 1, overdueCount: 1, text: "1 open · 1 overdue" },
    { locale: "en" as const, openCount: 5, overdueCount: 0, text: "5 open" },
    { locale: "en" as const, openCount: 0, overdueCount: 0, text: "Nothing open" },
    { locale: "cs" as const, openCount: 1, overdueCount: 0, text: "1 otevřený" },
    { locale: "cs" as const, openCount: 3, overdueCount: 2, text: "3 otevřené · 2 po termínu" },
    { locale: "cs" as const, openCount: 5, overdueCount: 1, text: "5 otevřených · 1 po termínu" },
    { locale: "cs" as const, openCount: 0, overdueCount: 0, text: "Nic otevřeného" },
  ])(
    "shows “$text” for $openCount open and $overdueCount overdue ($locale)",
    async ({ locale, openCount, overdueCount, text }) => {
      await useLocaleMessages(locale);

      const { container } = render(
        <TasksHeaderSummary openCount={openCount} overdueCount={overdueCount} />,
      );

      expect(container).toHaveTextContent(new RegExp(`^${text}$`));
      expect(screen.queryByRole("heading")).not.toBeInTheDocument();
    },
  );
});
