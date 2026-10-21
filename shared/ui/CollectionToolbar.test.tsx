import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Plus } from "lucide-react";
import type { ComponentProps } from "react";

import { CollectionToolbar } from "./CollectionToolbar";

type Filter = "pending" | "purchased";
type ToolbarProps = ComponentProps<typeof CollectionToolbar<Filter>>;

function renderToolbar(overrides: Partial<ToolbarProps> = {}) {
  const props: ToolbarProps = {
    activeFilter: "pending",
    eyebrow: "Cottage",
    title: "Supplies",
    description: "What to bring next time.",
    totalCount: 5,
    filterItems: [
      { label: "To buy", value: 3, filter: "pending" },
      { label: "Bought", value: 2, filter: "purchased" },
    ],
    filterAriaLabel: "Supply filters",
    filterPathname: "/shopping",
    ...overrides,
  };

  return render(<CollectionToolbar<Filter> {...props} />);
}

describe("CollectionToolbar", () => {
  it("renders the eyebrow, h2 title, description and total count", () => {
    renderToolbar();

    expect(screen.getByText("Cottage")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "Supplies" }),
    ).toBeInTheDocument();
    expect(screen.getByText("What to bring next time.")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("renders the filter navigation with the active filter marked", () => {
    renderToolbar();

    const nav = screen.getByRole("navigation", { name: "Supply filters" });
    expect(within(nav).getByRole("link", { name: "To buy (3)" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(
      within(nav).getByRole("link", { name: "Bought (2)" }),
    ).not.toHaveAttribute("aria-current");
  });

  it("renders summary items with their label and value", () => {
    renderToolbar({
      summaryItems: [
        { id: "overdue", label: "Overdue", value: 1, tone: "warning" },
        { id: "today", label: "Today", value: 2, tone: "neutral" },
      ],
    });

    const summary = screen
      .getAllByRole("list")
      .find((list) => within(list).queryByText("Overdue"));
    expect(summary).toBeDefined();

    const summaryItems = within(summary as HTMLElement).getAllByRole("listitem");
    expect(summaryItems).toHaveLength(2);
    expect(summaryItems[0]).toHaveTextContent("Overdue1");
    expect(summaryItems[1]).toHaveTextContent("Today2");
  });

  it("renders a neutral total count without an icon by default", () => {
    renderToolbar();

    const count = screen.getByText("5");
    expect(count).toHaveClass("text-ink-muted");
    expect(count.querySelector("svg")).toBeNull();
  });

  it("renders a success total count with the success tone and a decorative icon", () => {
    renderToolbar({ countTone: "success" });

    const label = screen.getByText("5").parentElement;
    expect(label).toHaveClass("text-success");
    expect(label?.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });

  it("renders without an eyebrow", () => {
    renderToolbar({ eyebrow: undefined });

    expect(screen.queryByText("Cottage")).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "Supplies" }),
    ).toBeInTheDocument();
  });

  it("marks warning and success summary items with a decorative icon, neutral ones without", () => {
    renderToolbar({
      summaryItems: [
        { id: "open", label: "Open", value: 4, tone: "neutral" },
        { id: "overdue", label: "Overdue", value: 1, tone: "warning" },
        { id: "done", label: "Done", value: 2, tone: "success" },
      ],
    });

    const items = screen
      .getAllByRole("listitem")
      .filter((item) => /^(Open|Overdue|Done)\d$/.test(item.textContent ?? ""));
    expect(items).toHaveLength(3);

    const [open, overdue, done] = items;
    expect(open.querySelector("svg")).toBeNull();
    expect(overdue.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    expect(done.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });

  it("keeps the primary action label visible at every width", () => {
    renderToolbar({
      primaryAction: { label: "Add item", onClick: vi.fn(), icon: Plus },
    });

    const label = within(screen.getByRole("button", { name: "Add item" })).getByText(
      "Add item",
    );
    expect(label).not.toHaveClass("sr-only");
  });

  it("renders no summary list when summaryItems is empty", () => {
    renderToolbar();

    expect(screen.queryByText("Overdue")).not.toBeInTheDocument();
    expect(screen.getAllByRole("list")).toHaveLength(1);
  });

  it("renders no primary action button when none is provided", () => {
    renderToolbar();

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("names the primary action by its label and calls onClick", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    renderToolbar({
      primaryAction: { label: "Add item", onClick, icon: Plus },
    });

    const button = screen.getByRole("button", { name: "Add item" });
    expect(button).toHaveAttribute("type", "button");
    expect(within(button).getByText("Add item")).toBeInTheDocument();

    await user.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("prefers the primary action ariaLabel as the accessible name", () => {
    renderToolbar({
      primaryAction: {
        label: "Add",
        ariaLabel: "Add supply item",
        onClick: vi.fn(),
      },
    });

    expect(
      screen.getByRole("button", { name: "Add supply item" }),
    ).toBeInTheDocument();
  });
});
