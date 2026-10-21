import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Clock } from "lucide-react";

import { StatusBadge, statusBadgeTone } from "./StatusBadge";

describe("StatusBadge", () => {
  it.each(Object.values(statusBadgeTone))(
    "renders its text for the %s tone",
    (tone) => {
      render(<StatusBadge tone={tone}>Due today</StatusBadge>);

      expect(screen.getByText("Due today")).toBeInTheDocument();
    },
  );

  it("renders numeric children as text", () => {
    render(<StatusBadge tone="neutral">{3}</StatusBadge>);

    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("renders the compact size with the same text", () => {
    render(
      <StatusBadge tone="success" size="compact">
        Occupied
      </StatusBadge>,
    );

    expect(screen.getByText("Occupied")).toBeInTheDocument();
  });

  it.each([
    ["warning", "text-warning"],
    ["success", "text-success"],
  ] as const)(
    "keeps the %s tone with a default decorative icon when no icon is passed",
    (tone, toneClass) => {
      const { container } = render(
        <StatusBadge tone={tone}>Overdue</StatusBadge>,
      );

      const label = container.firstElementChild;
      expect(label).toHaveClass(toneClass);
      expect(label?.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    },
  );

  it("uses the passed icon instead of the default one", () => {
    const { container } = render(
      <StatusBadge tone="warning" icon={Clock}>
        Due today
      </StatusBadge>,
    );

    expect(container.querySelectorAll("svg")).toHaveLength(1);
    expect(container.querySelector("svg")).toHaveClass("lucide-clock");
  });

  it("renders the neutral tone without an icon by default", () => {
    const { container } = render(<StatusBadge tone="neutral">3</StatusBadge>);

    expect(container.firstElementChild).toHaveClass("text-ink-secondary");
    expect(container.querySelector("svg")).toBeNull();
  });

  it("exposes the tones used by callers", () => {
    expect(Object.values(statusBadgeTone)).toEqual([
      "neutral",
      "warning",
      "success",
    ]);
  });
});
