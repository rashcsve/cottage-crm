import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { AuthSheet } from "./AuthSheet";

describe("AuthSheet", () => {
  it("renders the eyebrow, the page h1, the description and the content", () => {
    render(
      <AuthSheet
        eyebrow="Welcome back"
        title="Sign In"
        description="Sign in and see what's happening at the cottage."
      >
        <form aria-label="Sign in form" />
      </AuthSheet>,
    );

    expect(screen.getByText("Welcome back")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 1, name: "Sign In" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Sign in and see what's happening at the cottage."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("form", { name: "Sign in form" }),
    ).toBeInTheDocument();
  });
});
