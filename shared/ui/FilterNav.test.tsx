import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";

import { Link } from "@/i18n/navigation";

import { FilterNav } from "./FilterNav";

type Filter = "open" | "done";

const items = [
  { label: "Open", value: 4, filter: "open" as const },
  { label: "Done", value: 2, filter: "done" as const },
];

function renderFilterNav(activeFilter: Filter = "open") {
  return render(
    <FilterNav<Filter>
      activeFilter={activeFilter}
      items={items}
      ariaLabel="Task filters"
      pathname="/tasks"
    />,
  );
}

describe("FilterNav", () => {
  beforeEach(() => {
    vi.mocked(Link).mockClear();
  });

  it("renders a navigation landmark named by ariaLabel with one link per item", () => {
    renderFilterNav();

    const nav = screen.getByRole("navigation", { name: "Task filters" });
    expect(within(nav).getAllByRole("listitem")).toHaveLength(2);
    expect(within(nav).getAllByRole("link")).toHaveLength(2);
  });

  it("names each link with its label and count", () => {
    renderFilterNav();

    expect(screen.getByRole("link", { name: "Open (4)" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Done (2)" })).toBeInTheDocument();
  });

  it("shows the label and the count as visible text", () => {
    renderFilterNav();

    const link = screen.getByRole("link", { name: "Open (4)" });
    expect(within(link).getByText("Open")).toBeInTheDocument();
    expect(within(link).getByText("4")).toHaveAttribute("aria-hidden", "true");
  });

  it.each(["open", "done"] as const)(
    "marks only the active %s link with aria-current=page",
    (activeFilter) => {
      renderFilterNav(activeFilter);

      const active = activeFilter === "open" ? "Open (4)" : "Done (2)";
      const inactive = activeFilter === "open" ? "Done (2)" : "Open (4)";

      expect(screen.getByRole("link", { name: active })).toHaveAttribute(
        "aria-current",
        "page",
      );
      expect(screen.getByRole("link", { name: inactive })).not.toHaveAttribute(
        "aria-current",
      );
    },
  );

  it("links each item to the pathname with its filter in the query", () => {
    renderFilterNav();

    expect(screen.getByRole("link", { name: "Open (4)" })).toHaveAttribute(
      "href",
      "/tasks",
    );

    const hrefs = vi.mocked(Link).mock.calls.map(([props]) => props.href);
    expect(hrefs).toEqual([
      { pathname: "/tasks", query: { filter: "open" } },
      { pathname: "/tasks", query: { filter: "done" } },
    ]);
  });
});
