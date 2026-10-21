import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";

import { DashboardStats, type DashboardStat } from "./DashboardStats";

const stats: DashboardStat[] = [
  { id: "visits", href: "/visits", label: "Upcoming visits", value: 3 },
  {
    id: "tasks",
    href: "/tasks",
    label: "Open to-dos",
    value: 6,
    alert: "2 overdue",
  },
  { id: "shopping", href: "/shopping", label: "Supplies to buy", value: 4 },
  { id: "notes", href: "/notes", label: "Recent notes", value: 2 },
];

function renderStats() {
  render(<DashboardStats ariaLabel="Summary" stats={stats} />);
}

describe("DashboardStats", () => {
  it("renders a labelled region with a list of four linked stats in order", () => {
    renderStats();

    const region = screen.getByRole("region", { name: "Summary" });
    const items = within(region).getAllByRole("listitem");
    expect(items).toHaveLength(4);
    expect(
      items.map((item) => within(item).getByRole("link").getAttribute("href")),
    ).toEqual(["/visits", "/tasks", "/shopping", "/notes"]);
  });

  it.each([
    ["Upcoming visits", "/visits", "3"],
    ["Open to-dos", "/tasks", "6"],
    ["Supplies to buy", "/shopping", "4"],
    ["Recent notes", "/notes", "2"],
  ])("makes the whole %s cell one link with its label and value", (label, href, value) => {
    renderStats();

    const link = screen.getByRole("link", { name: new RegExp(`^${label}`) });
    expect(link).toHaveAttribute("href", href);
    expect(within(link).getByText(label)).toBeInTheDocument();
    expect(within(link).getByText(value)).toBeInTheDocument();
  });

  it("shows the alert with an icon only on the stat that has one", () => {
    renderStats();

    const tasksLink = screen.getByRole("link", { name: /^Open to-dos/ });
    const alert = within(tasksLink).getByText("2 overdue");
    expect(alert.parentElement?.querySelector("svg")).not.toBeNull();

    expect(screen.getAllByText(/overdue/)).toHaveLength(1);
  });
});
