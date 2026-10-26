import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import LoginPage from "./page";

vi.mock("@/lib/auth/redirect-if-authenticated", () => ({
  redirectIfAuthenticated: vi.fn(),
}));

vi.mock("next-intl/server", () => ({
  getTranslations: vi.fn(async () => (key: string) => key),
}));

vi.mock("@/app/[locale]/metadata", () => ({
  createPageMetadata: vi.fn(() => vi.fn()),
}));

vi.mock("@/app/[locale]/components/PublicShell", () => ({
  PublicShell: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

vi.mock("@/app/[locale]/components/auth/AuthSheet", () => ({
  AuthSheet: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

vi.mock("@/app/[locale]/components/auth/LoginForm", () => ({
  LoginForm: ({ initialError }: { initialError?: string }) => (
    <p data-testid="initial-error">{initialError ?? "none"}</p>
  ),
}));

async function renderPage(error?: string | string[]) {
  render(await LoginPage({ searchParams: Promise.resolve({ error }) }));
  return screen.getByTestId("initial-error");
}

describe("LoginPage", () => {
  it("passes the OAuth failure message when error=oauth", async () => {
    expect(await renderPage("oauth")).toHaveTextContent("errors.oauthFailed");
  });

  it("passes no initial error without an error param", async () => {
    expect(await renderPage()).toHaveTextContent("none");
  });

  it("ignores unknown error values", async () => {
    expect(await renderPage("other")).toHaveTextContent("none");
  });

  it("ignores array-valued error params", async () => {
    expect(await renderPage(["oauth", "oauth"])).toHaveTextContent("none");
  });
});
