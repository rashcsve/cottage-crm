import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next-intl/server", () => ({
  getTranslations: vi.fn(async (namespace: string) => {
    return (key: string) => `${namespace}.${key}`;
  }),
}));

import { Header } from "./Header";

describe("Header", () => {
  it("links to the login page when demo mode is off", async () => {
    render(await Header({ demoHref: null }));

    const link = screen.getByRole("link", { name: "navigation.login" });
    expect(link).toHaveAttribute("href", "/login");
  });

  it("links to the demo session route when demoHref is set", async () => {
    render(await Header({ demoHref: "/api/demo/session?locale=en" }));

    const link = screen.getByRole("link", { name: "demo.tryButton" });
    expect(link).toHaveAttribute("href", "/api/demo/session?locale=en");
    expect(
      screen.queryByRole("link", { name: "navigation.login" }),
    ).not.toBeInTheDocument();
  });
});
