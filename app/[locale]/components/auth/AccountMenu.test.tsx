import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { signOutAction } from "@/lib/auth/sign-out";

import { AccountMenu } from "./AccountMenu";

vi.mock("@/lib/auth/sign-out", () => ({
  signOutAction: vi.fn(),
}));

const mockSignOutAction = vi.mocked(signOutAction);

function renderAccountMenu(accountName = "Jana Nováková") {
  return render(
    <AccountMenu
      accountName={accountName}
      accountInitial="J"
      triggerLabel="Signed in as Jana Nováková"
      signOutLabel="Sign Out"
    />
  );
}

describe("AccountMenu", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders a closed avatar trigger named after the signed-in user", () => {
    renderAccountMenu();

    const trigger = screen.getByRole("button", {
      name: "Signed in as Jana Nováková",
    });

    expect(trigger).toHaveTextContent("J");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("opens a menu showing the account name and a sign-out item", async () => {
    const user = userEvent.setup();
    renderAccountMenu();

    const trigger = screen.getByRole("button", {
      name: "Signed in as Jana Nováková",
    });

    await user.click(trigger);

    const menu = screen.getByRole("menu");

    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(menu).toHaveTextContent("Jana Nováková");
    expect(
      screen.getByRole("menuitem", { name: "Sign Out" })
    ).toBeInTheDocument();
  });

  it("signs out when the sign-out item is chosen", async () => {
    const user = userEvent.setup();
    renderAccountMenu();

    await user.click(
      screen.getByRole("button", { name: "Signed in as Jana Nováková" })
    );
    await user.click(screen.getByRole("menuitem", { name: "Sign Out" }));

    await waitFor(() => {
      expect(mockSignOutAction).toHaveBeenCalledTimes(1);
    });
  });

  it("opens by keyboard and closes with Escape, returning focus to the trigger", async () => {
    const user = userEvent.setup();
    renderAccountMenu();

    const trigger = screen.getByRole("button", {
      name: "Signed in as Jana Nováková",
    });

    trigger.focus();
    await user.keyboard("{Enter}");

    expect(screen.getByRole("menu")).toBeInTheDocument();

    await user.keyboard("{Escape}");

    await waitFor(() => {
      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });
    expect(trigger).toHaveFocus();
  });

  it("signs out by keyboard with ArrowDown then Enter", async () => {
    const user = userEvent.setup();
    renderAccountMenu();

    screen.getByRole("button", { name: "Signed in as Jana Nováková" }).focus();
    await user.keyboard("{ArrowDown}");

    expect(screen.getByRole("menu")).toHaveAttribute(
      "aria-activedescendant",
      screen.getByRole("menuitem", { name: "Sign Out" }).id
    );

    await user.keyboard("{Enter}");

    await waitFor(() => {
      expect(mockSignOutAction).toHaveBeenCalledTimes(1);
    });
  });

  it("shows a very long account name in full", async () => {
    const user = userEvent.setup();
    const longName = "Jana Marie Nováková-Dvořáková ".repeat(4).trim();
    renderAccountMenu(longName);

    await user.click(
      screen.getByRole("button", { name: "Signed in as Jana Nováková" })
    );

    expect(screen.getByRole("menu")).toHaveTextContent(longName);
  });

  it("marks the trigger busy and blocks a second sign-out while pending", async () => {
    mockSignOutAction.mockReturnValue(new Promise<never>(() => {}));
    const user = userEvent.setup();
    renderAccountMenu();

    const trigger = screen.getByRole("button", {
      name: "Signed in as Jana Nováková",
    });

    await user.click(trigger);
    await user.click(screen.getByRole("menuitem", { name: "Sign Out" }));

    await waitFor(() => {
      expect(trigger).toHaveAttribute("aria-busy", "true");
    });
    expect(trigger).toBeDisabled();

    await user.click(trigger);

    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(mockSignOutAction).toHaveBeenCalledTimes(1);
  });
});
