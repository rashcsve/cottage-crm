import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { mockReducedMotion } from "@/tests/utils/mock-reduced-motion";
import { Hero } from "./Hero";

const baseProps = {
  eyebrow: "eyebrow",
  title: "title",
  description: "description",
  primaryCta: "Try the demo",
  secondaryCta: "View source on GitHub",
  githubUrl: "https://github.com/example/repo",
};

beforeEach(() => {
  mockReducedMotion(false);
});

describe("Hero", () => {
  it("shows the title immediately without any reveal animation", () => {
    render(<Hero {...baseProps} demoHref={null} />);

    const title = screen.getByRole("heading", { level: 1, name: "title" });
    expect(title).not.toHaveClass("motion-fade-in");
    expect(title).not.toHaveAttribute("style");
    expect(title.querySelector(".split-line")).toBeNull();
  });

  it("fades in the description and CTAs with staggered CSS delays", () => {
    render(<Hero {...baseProps} demoHref={null} />);

    const description = screen.getByText("description");
    expect(description).toHaveClass("motion-fade-in");
    expect(description).toHaveStyle({ animationDelay: "160ms" });

    const ctaRow = screen.getByRole("link", { name: "Try the demo" }).closest(".motion-fade-in");
    expect(ctaRow).toHaveStyle({ animationDelay: "240ms" });
  });

  it("opens the GitHub CTA in a new tab inside a pressable wrapper", () => {
    render(<Hero {...baseProps} demoHref={null} />);

    const github = screen.getByRole("link", { name: "View source on GitHub" });
    expect(github).toHaveAttribute("href", baseProps.githubUrl);
    expect(github).toHaveAttribute("target", "_blank");
    expect(github).toHaveAttribute("rel", "noopener noreferrer");
    expect(github.parentElement).toHaveClass("motion-press");
  });

  it("keeps content visible in the server-rendered HTML (no JS)", () => {
    const html = renderToString(<Hero {...baseProps} demoHref={null} />);

    expect(html).toContain("description");
    expect(html).not.toMatch(/opacity:\s*0/);
  });

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
