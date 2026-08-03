import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { render, screen } from "@testing-library/react";

import { Closing } from "./Closing";

class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | Document | null = null;
  readonly rootMargin: string = "";
  readonly thresholds: ReadonlyArray<number> = [];
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

const ORIGINAL_INTERSECTION_OBSERVER = global.IntersectionObserver;

beforeAll(() => {
  global.IntersectionObserver =
    MockIntersectionObserver as unknown as typeof IntersectionObserver;
});

afterAll(() => {
  global.IntersectionObserver = ORIGINAL_INTERSECTION_OBSERVER;
});

const baseProps = {
  title: "title",
  description: "description",
  cta: "Create your account",
  footerText: "footer",
  githubLabel: "GitHub",
  githubUrl: "https://github.com/example/repo",
  demoCta: "Try the demo",
};

describe("Closing", () => {
  it("links the CTA to signup when demo mode is off", () => {
    render(<Closing {...baseProps} demoHref={null} />);

    expect(
      screen.getByRole("link", { name: "Create your account" }),
    ).toHaveAttribute("href", "/signup");
  });

  it("links the CTA to the demo session route when demoHref is set", () => {
    render(<Closing {...baseProps} demoHref="/api/demo/session?locale=en" />);

    expect(screen.getByRole("link", { name: "Try the demo" })).toHaveAttribute(
      "href",
      "/api/demo/session?locale=en",
    );
    expect(
      screen.queryByRole("link", { name: "Create your account" }),
    ).not.toBeInTheDocument();
  });
});
