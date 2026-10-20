import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { usePathname } from "@/i18n/navigation";
import { AppNav } from "./AppNav";

const mockUsePathname = vi.mocked(usePathname);

const ITEMS = [
  { href: "/overview", label: "Home" },
  { href: "/visits", label: "Calendar" },
  { href: "/shopping", label: "Shopping supplies", shortLabel: "Supplies" },
  { href: "/tasks", label: "To-dos" },
  { href: "/notes", label: "Notes" },
];

describe.each(["top", "mobile"] as const)("AppNav variant=%s", (variant) => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders a named navigation landmark with one link per item", () => {
    mockUsePathname.mockReturnValue("/visits");

    render(
      <AppNav items={ITEMS} ariaLabel="Primary navigation" variant={variant} />
    );

    const navigation = screen.getByRole("navigation", {
      name: "Primary navigation",
    });

    expect(within(navigation).getAllByRole("listitem")).toHaveLength(5);
    expect(within(navigation).getAllByRole("link")).toHaveLength(5);
  });

  it("marks exactly one link as the current page", () => {
    mockUsePathname.mockReturnValue("/visits");

    render(
      <AppNav items={ITEMS} ariaLabel="Primary navigation" variant={variant} />
    );

    const currentLinks = screen
      .getAllByRole("link")
      .filter((link) => link.getAttribute("aria-current") === "page");

    expect(currentLinks).toHaveLength(1);
    expect(screen.getByRole("link", { name: "Calendar" })).toHaveAttribute(
      "aria-current",
      "page"
    );
    expect(screen.getByRole("link", { name: "Home" })).not.toHaveAttribute(
      "aria-current"
    );
  });

  it("marks nested routes as the current page", () => {
    mockUsePathname.mockReturnValue("/tasks/123");

    render(
      <AppNav items={ITEMS} ariaLabel="Primary navigation" variant={variant} />
    );

    expect(screen.getByRole("link", { name: "To-dos" })).toHaveAttribute(
      "aria-current",
      "page"
    );
  });

  it("exposes the full label when a short label is shown", () => {
    mockUsePathname.mockReturnValue("/overview");

    render(
      <AppNav items={ITEMS} ariaLabel="Primary navigation" variant={variant} />
    );

    const link = screen.getByRole("link", { name: "Shopping supplies" });

    expect(link).toHaveAttribute("href", "/shopping");
    expect(link).toHaveTextContent("Supplies");
  });

  it("lets labels wrap instead of truncating them", () => {
    mockUsePathname.mockReturnValue("/overview");

    render(
      <AppNav items={ITEMS} ariaLabel="Primary navigation" variant={variant} />
    );

    const navigation = screen.getByRole("navigation", {
      name: "Primary navigation",
    });

    expect(navigation.querySelector(".truncate")).toBeNull();
  });
});
