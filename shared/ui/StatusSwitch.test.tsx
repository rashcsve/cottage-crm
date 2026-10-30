import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StatusSwitch } from "./StatusSwitch";

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

type Filter = "pending" | "purchased";

const items = [
  { filter: "pending" as const, label: "Koupit", count: 5, countUnit: "položek" },
  { filter: "purchased" as const, label: "Koupené", count: 1, countUnit: "položka" },
];

function renderSwitch(
  activeFilter: Filter = "pending",
  onNavigate?: (filter: Filter, href: unknown) => void,
) {
  return render(
    <StatusSwitch<Filter>
      activeFilter={activeFilter}
      items={items}
      ariaLabel="Stav zásob"
      pathname="/shopping"
      onNavigate={onNavigate}
    />,
  );
}

describe("StatusSwitch", () => {
  it("renders one link per item with its filter URL inside a labelled navigation", () => {
    renderSwitch();

    const nav = screen.getByRole("navigation", { name: "Stav zásob" });

    expect(
      within(nav)
        .getAllByRole("link")
        .map((link) => link.getAttribute("href")),
    ).toEqual(["/shopping?filter=pending", "/shopping?filter=purchased"]);
  });

  it("names each link with its label, count and a spoken unit", () => {
    renderSwitch();

    expect(screen.getByRole("link", { name: "Koupit 5 položek" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Koupené 1 položka" })).toBeInTheDocument();
  });

  it("hides the unit visually so only the label and count show", () => {
    renderSwitch();

    expect(screen.getByText("položek")).toHaveClass("sr-only");
    expect(screen.getByText("Koupit")).not.toHaveClass("sr-only");
    expect(screen.getByText("5")).not.toHaveClass("sr-only");
  });

  it.each([
    { activeFilter: "pending" as const, current: "Koupit 5 položek", other: "Koupené 1 položka" },
    { activeFilter: "purchased" as const, current: "Koupené 1 položka", other: "Koupit 5 položek" },
  ])("marks only the $activeFilter link as the current page", ({ activeFilter, current, other }) => {
    renderSwitch(activeFilter);

    expect(screen.getByRole("link", { name: current })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: other })).not.toHaveAttribute("aria-current");
  });

  it("keeps the reader's scroll position when a link is followed", () => {
    renderSwitch();

    for (const link of screen.getAllByRole("link")) {
      expect(link).toHaveAttribute("data-scroll", "false");
    }
  });

  it("hands the clicked filter and its URL to onNavigate", async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    renderSwitch("pending", onNavigate);

    await user.click(screen.getByRole("link", { name: "Koupené 1 položka" }));

    expect(onNavigate).toHaveBeenCalledWith("purchased", {
      pathname: "/shopping",
      query: { filter: "purchased" },
    });
  });
});
