import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

vi.mock("next-intl/server", () => ({
  getTranslations: vi.fn(async (namespace: string) => {
    return (key: string, values?: { name?: string }) =>
      values?.name
        ? `${namespace}.${key}:${values.name}`
        : `${namespace}.${key}`;
  }),
}));
vi.mock("@/lib/auth/sign-out", () => ({
  signOutAction: vi.fn(),
}));
vi.mock("@/features/dashboard/hooks/useClientWeather", () => ({
  useClientWeather: vi.fn(() => null),
}));
vi.mock("./DemoModeBanner", () => ({
  DemoModeBanner: () => null,
}));

import { AppShell } from "./AppShell";

async function renderAppShell(userName?: string) {
  render(
    await AppShell({
      children: <button type="button">Main action</button>,
      userName,
    })
  );
}

describe("AppShell", () => {
  it("tabs from the skip link through nav, language and the avatar menu into main", async () => {
    const user = userEvent.setup();
    await renderAppShell("Jana");

    const headerNav = screen.getAllByRole("navigation", {
      name: "appShell.navigationLabel",
    })[0];
    const expectedOrder = [
      screen.getByRole("link", { name: "common.skipToContent" }),
      screen.getByRole("link", { name: "appShell.title" }),
      ...Array.from(headerNav.querySelectorAll("a")),
      screen.getByRole("button", { name: "Čeština" }),
      screen.getByRole("button", { name: "English" }),
      screen.getByRole("button", { name: "appShell.signedInAs:Jana" }),
      screen.getByRole("button", { name: "Main action" }),
    ];

    for (const element of expectedOrder) {
      await user.tab();
      expect(element).toHaveFocus();
    }

    expect(screen.getByRole("main")).toContainElement(
      screen.getByRole("button", { name: "Main action" })
    );
  });

  it("falls back to the account name and its initial when the user name is blank", async () => {
    await renderAppShell("   ");

    expect(
      screen.getByRole("button", {
        name: "appShell.signedInAs:appShell.accountFallbackName",
      })
    ).toHaveTextContent("A");
  });

  it("pads header and main clear of a landscape notch", async () => {
    await renderAppShell("Jana");

    const shell = screen.getByRole("banner").parentElement;
    expect(shell).toContainElement(screen.getByRole("main"));
    expect(shell?.style.paddingLeft).toBe("var(--safe-area-left)");
    expect(shell?.style.paddingRight).toBe("var(--safe-area-right)");
  });

  it("pads the fixed mobile nav clear of a landscape notch", async () => {
    await renderAppShell("Jana");

    const mobileNav = screen.getAllByRole("navigation", {
      name: "appShell.navigationLabel",
    })[1].parentElement;
    expect(mobileNav?.style.paddingLeft).toBe("var(--safe-area-left)");
    expect(mobileNav?.style.paddingRight).toBe("var(--safe-area-right)");
    expect(mobileNav?.style.paddingBottom).toBe("var(--safe-area-bottom)");
  });

  it("uses the uppercased first letter of a name with diacritics", async () => {
    await renderAppShell("šárka");

    expect(
      screen.getByRole("button", { name: "appShell.signedInAs:šárka" })
    ).toHaveTextContent("Š");
  });
});
