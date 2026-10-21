import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { TextLink } from "@/shared/ui/TextLink";

import { PageFeedback } from "./PageFeedback";

describe("PageFeedback", () => {
  it("renders a neutral message without an alert role", () => {
    render(
      <PageFeedback
        title="Page not found"
        description="The page you are looking for does not exist."
        actions={<TextLink href="/overview">Back home</TextLink>}
      />,
    );

    expect(
      screen.getByRole("heading", { level: 1, name: "Page not found" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("The page you are looking for does not exist."),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back home" })).toHaveAttribute(
      "href",
      "/overview",
    );
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("announces an error message as an alert", () => {
    render(
      <PageFeedback
        tone="error"
        title="Something went wrong"
        description="Try again in a moment."
      />,
    );

    const alert = screen.getByRole("alert");
    expect(alert).toContainElement(
      screen.getByRole("heading", { level: 1, name: "Something went wrong" }),
    );
    expect(alert).toHaveTextContent("Try again in a moment.");
  });
});
