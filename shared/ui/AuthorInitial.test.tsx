import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { AuthorInitial } from "./AuthorInitial";

describe("AuthorInitial", () => {
  it("shows the first letter of the author in upper case, hidden from screen readers", () => {
    render(<AuthorInitial author="šárka" locale="cs" />);

    expect(screen.getByText("Š")).toHaveAttribute("aria-hidden", "true");
  });

  it("keeps a decomposed accented letter as one initial", () => {
    render(<AuthorInitial author={"Šárka"} locale="cs" />);

    expect(screen.getByText("Š")).toBeInTheDocument();
  });

  it("falls back to a question mark when the author is empty", () => {
    render(<AuthorInitial author="" locale="en" />);

    expect(screen.getByText("?")).toBeInTheDocument();
  });

  it("falls back to a question mark when the author is only whitespace", () => {
    render(<AuthorInitial author="   " locale="en" />);

    expect(screen.getByText("?")).toBeInTheDocument();
  });

  it("ignores leading whitespace", () => {
    render(<AuthorInitial author="  bob" locale="en" />);

    expect(screen.getByText("B")).toBeInTheDocument();
  });
});
