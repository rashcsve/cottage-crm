import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { useTranslations } from "next-intl";
import { createTranslatorMock } from "@/tests/utils/create-translator-mock";
import { NotesFilterChips } from "./NotesFilterChips";

vi.mock("next-intl", () => ({
  useTranslations: vi.fn(),
}));

vi.mock("@/i18n/navigation", () => ({
  Link: ({
    href,
    children,
    ...props
  }: {
    href: { pathname: string; query?: Record<string, string> };
    children: React.ReactNode;
  }) => (
    <a
      href={
        href.query
          ? `${href.pathname}?${new URLSearchParams(href.query).toString()}`
          : href.pathname
      }
      {...props}
    >
      {children}
    </a>
  ),
}));

const mockUseTranslations = vi.mocked(useTranslations);

describe("NotesFilterChips", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUseTranslations.mockImplementation((namespace?: string) => {
      const translator = createTranslatorMock();
      const prefix = namespace ? `${namespace}.` : "";

      return ((key: string, values?: Record<string, unknown>) =>
        translator(`${prefix}${key}`, values)) as unknown as ReturnType<
        typeof useTranslations
      >;
    });
  });

  it("renders All, With photos and Mine links inside a labelled navigation, with All dropping the query", () => {
    render(<NotesFilterChips activeShow="all" />);

    const nav = screen.getByRole("navigation", {
      name: "notes.showFilter.ariaLabel",
    });

    expect(
      within(nav)
        .getAllByRole("link")
        .map((link) => [link.textContent, link.getAttribute("href")]),
    ).toEqual([
      ["notes.showFilter.all", "/notes"],
      ["notes.showFilter.photos", "/notes?show=photos"],
      ["notes.showFilter.mine", "/notes?show=mine"],
    ]);
  });

  it.each(["all", "photos", "mine"] as const)(
    "marks only the %s chip as the current page",
    (activeShow) => {
      render(<NotesFilterChips activeShow={activeShow} />);

      const current = screen
        .getAllByRole("link")
        .filter((link) => link.getAttribute("aria-current") === "page")
        .map((link) => link.textContent);

      expect(current).toEqual([`notes.showFilter.${activeShow}`]);
    },
  );
});
