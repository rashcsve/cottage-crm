import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { renderToString } from "react-dom/server";

import { mockReducedMotion } from "@/tests/utils/mock-reduced-motion";
import { Features } from "./Features";

const props = {
  eyebrow: "eyebrow",
  title: "Features title",
  items: [
    { index: "01", title: "Visits", description: "Plan stays" },
    { index: "02", title: "Shopping", description: "Shared list" },
    { index: "03", title: "Tasks", description: "Chores" },
  ],
};

beforeEach(() => {
  mockReducedMotion(false);
});

describe("Features", () => {
  it("renders the eyebrow, heading and every item in order", () => {
    render(<Features {...props} />);

    expect(screen.getByText("eyebrow")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "Features title" }),
    ).toBeInTheDocument();

    const items = within(screen.getByRole("list")).getAllByRole("listitem");
    expect(items).toHaveLength(3);
    items.forEach((item, index) => {
      const { index: number, title, description } = props.items[index];
      expect(within(item).getByText(number)).toBeInTheDocument();
      expect(
        within(item).getByRole("heading", { level: 3, name: title }),
      ).toBeInTheDocument();
      expect(within(item).getByText(description)).toBeInTheDocument();
    });
  });

  it("hides nothing when reduced motion is preferred", () => {
    mockReducedMotion(true);

    const { container } = render(<Features {...props} />);

    expect(container.querySelectorAll('[style*="opacity: 0"]')).toHaveLength(0);
    expect(container.querySelectorAll('[data-reveal="hidden"]')).toHaveLength(0);
  });

  it("keeps content visible in the server-rendered HTML (no JS)", () => {
    const html = renderToString(<Features {...props} />);

    expect(html).toContain("Features title");
    expect(html).not.toMatch(/opacity:\s*0/);
    expect(html).not.toContain('data-reveal="hidden"');
  });

  it("reveals the heading block and each item on scroll", () => {
    const { container } = render(<Features {...props} />);

    expect(container.querySelectorAll('[data-reveal="hidden"]')).toHaveLength(4);
    screen.getAllByRole("listitem").forEach((item, index) => {
      expect(item).toHaveAttribute("data-reveal", "hidden");
      expect(item.style.getPropertyValue("--reveal-delay")).toBe(`${index * 100}ms`);
      expect(item.style.transitionDelay).toBe("");
    });
  });
});
