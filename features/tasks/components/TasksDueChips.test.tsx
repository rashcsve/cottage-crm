import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useTranslations } from "next-intl";
import { createTranslatorMock } from "@/tests/utils/create-translator-mock";
import { TasksDueChips } from "./TasksDueChips";

vi.mock("next-intl", () => ({
  useTranslations: vi.fn(),
}));

vi.mock("@/i18n/navigation", () => ({
  Link: ({
    href,
    children,
    scroll,
    onNavigate,
    ...props
  }: {
    href: { pathname: string; query?: Record<string, string> };
    children: React.ReactNode;
    scroll?: boolean;
    onNavigate?: (event: { preventDefault: () => void }) => void;
  }) => (
    <a
      href={`${href.pathname}?${new URLSearchParams(href.query).toString()}`}
      data-scroll={String(scroll)}
      onClick={(event) => {
        event.preventDefault();
        onNavigate?.({ preventDefault: () => {} });
      }}
      {...props}
    >
      {children}
    </a>
  ),
}));

const mockUseTranslations = vi.mocked(useTranslations);

describe("TasksDueChips", () => {
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

  it("renders All, This week and No date links that keep the open filter inside a labelled navigation", () => {
    render(<TasksDueChips activeDue="all" />);

    const nav = screen.getByRole("navigation", {
      name: "tasks.dueFilter.ariaLabel",
    });

    expect(
      within(nav)
        .getAllByRole("link")
        .map((link) => [link.textContent, link.getAttribute("href")]),
    ).toEqual([
      ["tasks.dueFilter.all", "/tasks?filter=open"],
      ["tasks.dueFilter.week", "/tasks?filter=open&due=week"],
      ["tasks.dueFilter.none", "/tasks?filter=open&due=none"],
    ]);
  });

  it.each(["all", "week", "none"] as const)(
    "marks only the %s chip as the current page",
    (activeDue) => {
      render(<TasksDueChips activeDue={activeDue} />);

      const current = screen
        .getAllByRole("link")
        .filter((link) => link.getAttribute("aria-current") === "page")
        .map((link) => link.textContent);

      expect(current).toEqual([`tasks.dueFilter.${activeDue}`]);
    },
  );

  it("keeps the reader's scroll position when a chip is followed", () => {
    render(<TasksDueChips activeDue="all" />);

    for (const link of screen.getAllByRole("link")) {
      expect(link).toHaveAttribute("data-scroll", "false");
    }
  });

  it("hands the clicked due filter and its URL to onNavigate", async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    render(<TasksDueChips activeDue="all" onNavigate={onNavigate} />);

    await user.click(screen.getByRole("link", { name: "tasks.dueFilter.week" }));

    expect(onNavigate).toHaveBeenCalledWith("week", {
      pathname: "/tasks",
      query: { filter: "open", due: "week" },
    });
  });
});
