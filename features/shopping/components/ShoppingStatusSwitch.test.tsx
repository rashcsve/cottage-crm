import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { useTranslations } from "next-intl";
import { createTranslatorMock } from "@/tests/utils/create-translator-mock";
import { ShoppingStatusSwitch } from "./ShoppingStatusSwitch";

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
      href={`${href.pathname}?${new URLSearchParams(href.query).toString()}`}
      {...props}
    >
      {children}
    </a>
  ),
}));

const mockUseTranslations = vi.mocked(useTranslations);

describe("ShoppingStatusSwitch", () => {
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

  it("renders To buy and Bought links with their counts inside a labelled navigation", () => {
    render(
      <ShoppingStatusSwitch activeFilter="pending" pendingCount={5} purchasedCount={12} />,
    );

    const nav = screen.getByRole("navigation", { name: "shopping.switch.ariaLabel" });

    expect(
      within(nav)
        .getAllByRole("link")
        .map((link) => [link.textContent, link.getAttribute("href")]),
    ).toEqual([
      ["shopping.switch.pending 5 shopping.switch.countUnit", "/shopping?filter=pending"],
      ["shopping.switch.purchased 12 shopping.switch.countUnit", "/shopping?filter=purchased"],
    ]);
  });

  it.each([
    {
      activeFilter: "pending" as const,
      current: "shopping.switch.pending 5 shopping.switch.countUnit",
      other: "shopping.switch.purchased 12 shopping.switch.countUnit",
    },
    {
      activeFilter: "purchased" as const,
      current: "shopping.switch.purchased 12 shopping.switch.countUnit",
      other: "shopping.switch.pending 5 shopping.switch.countUnit",
    },
  ])(
    "marks only the $activeFilter link as the current page",
    ({ activeFilter, current, other }) => {
      render(
        <ShoppingStatusSwitch
          activeFilter={activeFilter}
          pendingCount={5}
          purchasedCount={12}
        />,
      );

      expect(screen.getByRole("link", { name: current })).toHaveAttribute(
        "aria-current",
        "page",
      );
      expect(screen.getByRole("link", { name: other })).not.toHaveAttribute(
        "aria-current",
      );
    },
  );
});
