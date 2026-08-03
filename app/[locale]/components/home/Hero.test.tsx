import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@/shared/hooks/useSplitLinesReveal", () => ({
  useSplitLinesReveal: () => ({ current: null }),
}));

import { Hero } from "./Hero";

const baseProps = {
  eyebrow: "eyebrow",
  title: "title",
  description: "description",
  primaryCta: "Try the demo",
  secondaryCta: "View source on GitHub",
  githubUrl: "https://github.com/example/repo",
};

describe("Hero", () => {
  it("links the primary CTA to signup when demo mode is off", () => {
    render(<Hero {...baseProps} demoHref={null} />);

    expect(screen.getByRole("link", { name: "Try the demo" })).toHaveAttribute(
      "href",
      "/signup",
    );
  });

  it("links the primary CTA to the demo session route when demoHref is set", () => {
    render(<Hero {...baseProps} demoHref="/api/demo/session?locale=en" />);

    expect(screen.getByRole("link", { name: "Try the demo" })).toHaveAttribute(
      "href",
      "/api/demo/session?locale=en",
    );
  });
});
