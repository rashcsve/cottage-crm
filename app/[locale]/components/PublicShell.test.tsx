import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

const { getDemoCtaHrefMock } = vi.hoisted(() => ({
  getDemoCtaHrefMock: vi.fn(),
}));

vi.mock("next-intl/server", () => ({
  getTranslations: vi.fn(async (namespace: string) => {
    return (key: string) => `${namespace}.${key}`;
  }),
  getLocale: vi.fn(async () => "en"),
}));
vi.mock("@/lib/demo/demo-session-url", () => ({
  getDemoCtaHref: getDemoCtaHrefMock,
}));

import { PublicShell } from "./PublicShell";

describe("PublicShell", () => {
  it("shows the normal login action when demo mode is off", async () => {
    getDemoCtaHrefMock.mockReturnValue(null);

    render(await PublicShell({ children: null, currentPath: "/login" }));

    const link = screen.getByRole("link", { name: "navigation.signup" });
    expect(link).toHaveAttribute("href", "/signup");
  });

  it("shows a single demo CTA and hides the normal login/signup actions when demo mode is on", async () => {
    getDemoCtaHrefMock.mockReturnValue("/api/demo/session?locale=en");

    render(await PublicShell({ children: null, currentPath: "/login" }));

    const link = screen.getByRole("link", { name: "demo.tryButton" });
    expect(link).toHaveAttribute("href", "/api/demo/session?locale=en");
    expect(
      screen.queryByRole("link", { name: "navigation.signup" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "navigation.login" }),
    ).not.toBeInTheDocument();
  });
});
