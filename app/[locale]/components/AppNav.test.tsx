import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { usePathname } from "@/i18n/navigation";
import { AppNav } from "./AppNav";

const mockUsePathname = vi.mocked(usePathname);

describe("AppNav", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders a desktop rail navigation with the active link marked", () => {
    mockUsePathname.mockReturnValue("/visits");

    render(
      <AppNav
        items={[
          { href: "/overview", label: "Home" },
          { href: "/visits", label: "Calendar" },
          { href: "/tasks", label: "To-dos" },
        ]}
        ariaLabel="Primary navigation"
      />
    );

    const navigation = screen.getByRole("navigation", {
      name: "Primary navigation",
    });

    expect(navigation.querySelector("ul")).toHaveClass("flex", "flex-col");
    expect(screen.getByRole("link", { name: "Calendar" })).toHaveAttribute(
      "aria-current",
      "page"
    );
  });

  it("renders an accessible mobile navigation row with the active link marked", () => {
    mockUsePathname.mockReturnValue("/tasks");

    render(
      <AppNav
        items={[
          { href: "/", label: "Home" },
          {
            href: "/shopping",
            label: "Supplies",
          },
          { href: "/tasks", label: "To-dos" },
          { href: "/notes", label: "Notes" },
        ]}
        ariaLabel="Primary navigation"
        variant="mobile"
      />
    );

    const navigation = screen.getByRole("navigation", {
      name: "Primary navigation",
    });

    expect(navigation.querySelector("ul")).toHaveClass("grid");
    expect(navigation.querySelector("ul")).toHaveStyle({
      gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    });
    expect(screen.getByRole("link", { name: "To-dos" })).toHaveAttribute(
      "aria-current",
      "page"
    );
    expect(screen.getByRole("link", { name: "Home" })).not.toHaveAttribute(
      "aria-current"
    );
    expect(screen.getByRole("link", { name: "Supplies" })).toHaveTextContent(
      "Supplies"
    );
  });
});
