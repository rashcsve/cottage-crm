import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Clock } from "lucide-react";

import { StatusLabel, statusLabelTone } from "./StatusLabel";

describe("StatusLabel", () => {
  it("exposes the neutral, warning, success and danger tones", () => {
    expect(Object.values(statusLabelTone)).toEqual([
      "neutral",
      "warning",
      "success",
      "danger",
    ]);
  });

  it.each(["danger", "warning", "success"] as const)(
    "renders the text with a decorative icon for the %s tone",
    (tone) => {
      render(
        <StatusLabel tone={tone} icon={Clock}>
          Due today
        </StatusLabel>,
      );

      const label = screen.getByText("Due today").closest("span");
      const icon = label?.parentElement?.querySelector("svg");
      expect(icon).not.toBeNull();
      expect(icon).toHaveAttribute("aria-hidden", "true");
    },
  );

  it("renders a neutral label without an icon when none is given", () => {
    const { container } = render(
      <StatusLabel tone="neutral">High priority</StatusLabel>,
    );

    expect(screen.getByText("High priority")).toBeInTheDocument();
    expect(container.querySelector("svg")).toBeNull();
  });

  it("renders numeric children as text", () => {
    render(<StatusLabel tone="neutral">{3}</StatusLabel>);

    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it.each([
    ["neutral", "text-ink-secondary"],
    ["warning", "text-warning"],
    ["success", "text-success"],
    ["danger", "text-danger"],
  ] as const)("applies the %s tone class", (tone, toneClass) => {
    const { container } =
      tone === "neutral"
        ? render(<StatusLabel tone={tone}>Status</StatusLabel>)
        : render(
            <StatusLabel tone={tone} icon={Clock}>
              Status
            </StatusLabel>,
          );

    expect(container.firstElementChild).toHaveClass(toneClass);
  });

  it("renders a neutral label with an icon when one is given", () => {
    const { container } = render(
      <StatusLabel tone="neutral" icon={Clock}>
        Upcoming
      </StatusLabel>,
    );

    expect(container.querySelector("svg")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });

  it("exposes only the text to assistive tech", () => {
    render(
      <StatusLabel tone="danger" icon={Clock}>
        Overdue
      </StatusLabel>,
    );

    expect(screen.getByText("Overdue").closest("span")?.parentElement).toHaveTextContent(
      /^Overdue$/,
    );
  });
});
