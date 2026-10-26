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
  it("links home with the wordmark instead of the CC tile", async () => {
    getDemoCtaHrefMock.mockReturnValue(null);

    render(await PublicShell({ children: null, currentPath: "/login" }));

    expect(
      screen.getByRole("link", { name: "appShell.title" }),
    ).toHaveAttribute("href", "/");
    expect(screen.queryByText("CC")).not.toBeInTheDocument();
  });

  it("renders the children inside the main landmark", async () => {
    getDemoCtaHrefMock.mockReturnValue(null);

    render(
      await PublicShell({ children: <p>Page body</p>, currentPath: "/login" }),
    );

    expect(screen.getByRole("main")).toHaveTextContent("Page body");
  });

  it("shows the normal login action when demo mode is off", async () => {
    getDemoCtaHrefMock.mockReturnValue(null);

    render(await PublicShell({ children: null, currentPath: "/login" }));

    const link = screen.getByRole("link", { name: "navigation.signup" });
    expect(link).toHaveAttribute("href", "/signup");
  });

  it("shows login and a signup action hidden below sm on the home page when demo mode is off", async () => {
    getDemoCtaHrefMock.mockReturnValue(null);

    render(await PublicShell({ children: null, currentPath: "/" }));

    expect(
      screen.getByRole("link", { name: "navigation.login" }),
    ).toHaveAttribute("href", "/login");
    const signup = screen.getByRole("link", { name: "navigation.signup" });
    expect(signup).toHaveAttribute("href", "/signup");
    expect(signup.parentElement).toHaveClass("hidden", "sm:block");
  });

  it("shows only the demo CTA on the home page when demo mode is on", async () => {
    getDemoCtaHrefMock.mockReturnValue("/api/demo/session?locale=en");

    render(await PublicShell({ children: null, currentPath: "/" }));

    expect(
      screen.getByRole("link", { name: "demo.tryButton" }),
    ).toHaveAttribute("href", "/api/demo/session?locale=en");
    expect(
      screen.queryByRole("link", { name: "navigation.signup" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "navigation.login" }),
    ).not.toBeInTheDocument();
  });

  it("uses the auth layout by default and centres marketing content from lg", async () => {
    getDemoCtaHrefMock.mockReturnValue(null);

    const { unmount } = render(
      await PublicShell({ children: null, currentPath: "/login" }),
    );
    expect(screen.getByRole("main")).toHaveClass("lg:py-16");
    expect(screen.getByRole("main")).not.toHaveClass("lg:items-center");
    unmount();

    render(
      await PublicShell({
        children: null,
        currentPath: "/",
        contentVariant: "marketing",
      }),
    );
    expect(screen.getByRole("main")).toHaveClass("lg:items-center");
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
