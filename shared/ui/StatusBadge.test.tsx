import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

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

  it("exposes the tones used by callers", () => {
    expect(Object.values(statusBadgeTone)).toEqual([
      "neutral",
      "warning",
      "success",
    ]);
  });
});
