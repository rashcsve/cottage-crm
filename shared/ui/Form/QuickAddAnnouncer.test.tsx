import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { QuickAddAnnouncer } from "./QuickAddAnnouncer";

describe("QuickAddAnnouncer", () => {
  it("renders an empty, visually hidden polite status region", () => {
    render(<QuickAddAnnouncer announcement={{ id: 0, text: "" }} />);

    const region = screen.getByRole("status");
    expect(region).toHaveTextContent("");
    expect(region).toHaveClass("sr-only");
  });

  it("shows the announcement text", () => {
    render(
      <QuickAddAnnouncer announcement={{ id: 1, text: "Added: Milk" }} />,
    );

    expect(screen.getByRole("status")).toHaveTextContent("Added: Milk");
  });

  it("remounts the text node when the id changes, even with the same text", () => {
    const { rerender } = render(
      <QuickAddAnnouncer announcement={{ id: 1, text: "Added: Milk" }} />,
    );
    const region = screen.getByRole("status");
    const firstChild = region.firstElementChild;

    rerender(
      <QuickAddAnnouncer announcement={{ id: 2, text: "Added: Milk" }} />,
    );

    expect(screen.getByRole("status")).toBe(region);
    expect(region.firstElementChild).not.toBe(firstChild);
    expect(region).toHaveTextContent("Added: Milk");
  });
});
