import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { ItemByline, RelativeTime } from "./ItemByline";

const now = new Date("2026-10-14T12:00:00.000Z");

describe("RelativeTime", () => {
  it("renders a relative time with the full Prague timestamp as its title", () => {
    render(
      <RelativeTime dateTime="2026-10-14T09:00:00.000Z" locale="en" now={now} />,
    );

    const time = screen.getByText("3 hours ago");
    expect(time.tagName).toBe("TIME");
    expect(time).toHaveAttribute("dateTime", "2026-10-14T09:00:00.000Z");
    expect(time).toHaveAttribute("title", expect.stringContaining("11:00"));
    expect(time).toHaveClass("font-mono");
  });

  it("shows the date and time once the timestamp is a week old", () => {
    render(
      <RelativeTime dateTime="2026-10-07T12:00:00.000Z" locale="cs" now={now} />,
    );

    expect(screen.getByText("7. 10. 2026 14:00")).toBeInTheDocument();
  });
});

describe("ItemByline", () => {
  it("shows the name and time, and announces the label instead of the bare name", () => {
    const { container } = render(
      <ItemByline
        name="Anna"
        label="Added by Anna"
        dateTime="2026-10-12T12:00:00.000Z"
        locale="en"
        now={now}
      />,
    );

    expect(screen.getByText("Added by Anna")).toHaveClass("sr-only");
    expect(screen.getByText("Anna")).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByText("·")).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByText("2 days ago").tagName).toBe("TIME");
    expect(container.firstElementChild).toHaveClass("text-ink-secondary");
  });

  it("shows only the time when there is no name", () => {
    render(
      <ItemByline
        label="Added"
        dateTime="2026-10-12T12:00:00.000Z"
        locale="en"
        now={now}
      />,
    );

    expect(screen.getByText("Added")).toHaveClass("sr-only");
    expect(screen.queryByText("·")).not.toBeInTheDocument();
    expect(screen.getByText("2 days ago")).toBeInTheDocument();
  });

  it("uses the smaller meta size on mobile when compact", () => {
    const { container } = render(
      <ItemByline
        label="Added"
        dateTime="2026-10-12T12:00:00.000Z"
        locale="en"
        now={now}
        size="compact"
      />,
    );

    expect(container.firstElementChild).toHaveClass("text-2xs", "sm:text-xs");
    expect(container.firstElementChild).not.toHaveClass("text-xs");
  });
});
