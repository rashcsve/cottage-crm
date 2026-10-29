import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { StatusSwitch } from "./StatusSwitch";

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

type Filter = "pending" | "purchased";

const items = [
  { filter: "pending" as const, label: "Koupit", count: 5, countUnit: "položek" },
  { filter: "purchased" as const, label: "Koupené", count: 1, countUnit: "položka" },
];

function renderSwitch(activeFilter: Filter = "pending") {
  return render(
    <StatusSwitch<Filter>
      activeFilter={activeFilter}
      items={items}
      ariaLabel="Stav zásob"
      pathname="/shopping"
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
});
