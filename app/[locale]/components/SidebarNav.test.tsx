import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { usePathname } from "@/i18n/navigation";
import { SidebarNav } from "./SidebarNav";

const mockUsePathname = vi.mocked(usePathname);

describe("SidebarNav", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders an accessible mobile navigation row with the active link marked", () => {
    mockUsePathname.mockReturnValue("/tasks");

    render(
      <SidebarNav
        items={[
          { href: "/", label: "Home" },
          { href: "/tasks", label: "Tasks" },
          { href: "/notes", label: "Notes" },
        ]}
        ariaLabel="Primary navigation"
        variant="mobile"
      />
    );

    const navigation = screen.getByRole("navigation", {
      name: "Primary navigation",
    });

    expect(navigation.querySelector("ul")).toHaveClass("grid", "grid-cols-4");
    expect(screen.getByRole("link", { name: "Tasks" })).toHaveAttribute(
      "aria-current",
      "page"
    );
    expect(screen.getByRole("link", { name: "Home" })).not.toHaveAttribute(
      "aria-current"
    );
  });
});
