import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useLocale, useTranslations } from "next-intl";
import { googleSignInAction } from "./actions";
import { GoogleSignInButton } from "./GoogleSignInButton";

vi.mock("./actions", () => ({
  googleSignInAction: vi.fn(),
}));

const mockGoogleSignInAction = vi.mocked(googleSignInAction);
const mockUseLocale = vi.mocked(useLocale);

describe("GoogleSignInButton", () => {
  let mockAssign: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockAssign = vi.fn();
    vi.stubGlobal("location", { ...window.location, assign: mockAssign });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("exposes the visible label as its accessible name and hides the logo", () => {
    render(<GoogleSignInButton />);

    const button = screen.getByRole("button", { name: "google" });
    const logo = button.querySelector("svg");

    expect(button).toHaveAttribute("type", "button");
    expect(button).toBeEnabled();
    expect(button.querySelector("img")).toBeNull();
    expect(logo).toHaveAttribute("aria-hidden", "true");
    expect(logo).toHaveAttribute("focusable", "false");
  });

  it("starts the OAuth flow for the current locale and redirects to the returned URL", async () => {
    const user = userEvent.setup();
    mockUseLocale.mockReturnValue("cs");
    mockGoogleSignInAction.mockResolvedValueOnce({
      ok: true,
      url: "https://example.supabase.co/auth/v1/authorize?provider=google",
    });

    render(<GoogleSignInButton />);
    await user.click(screen.getByRole("button", { name: "google" }));

    await waitFor(() => {
      expect(mockAssign).toHaveBeenCalledWith(
        "https://example.supabase.co/auth/v1/authorize?provider=google"
      );
    });
    expect(mockGoogleSignInAction).toHaveBeenCalledWith("cs");
  });

  it("is disabled and shows the redirecting label while the action is pending", async () => {
    const user = userEvent.setup();
    mockGoogleSignInAction.mockReturnValueOnce(new Promise(() => {}));

    render(<GoogleSignInButton />);
    await user.click(screen.getByRole("button", { name: "google" }));

    expect(
      await screen.findByRole("button", { name: "redirecting" })
    ).toBeDisabled();
  });

  it("re-enables the button when the page is restored from the back-forward cache", async () => {
    const user = userEvent.setup();
    mockGoogleSignInAction.mockResolvedValueOnce({
      ok: true,
      url: "https://example.supabase.co/auth/v1/authorize?provider=google",
    });

    render(<GoogleSignInButton />);
    await user.click(screen.getByRole("button", { name: "google" }));

    expect(
      await screen.findByRole("button", { name: "redirecting" })
    ).toBeDisabled();

    act(() => {
      window.dispatchEvent(
        new PageTransitionEvent("pageshow", { persisted: true })
      );
    });

    expect(screen.getByRole("button", { name: "google" })).toBeEnabled();
  });

  it("stays disabled on a pageshow that is not a back-forward cache restore", async () => {
    const user = userEvent.setup();
    mockGoogleSignInAction.mockResolvedValueOnce({
      ok: true,
      url: "https://example.supabase.co/auth/v1/authorize?provider=google",
    });

    render(<GoogleSignInButton />);
    await user.click(screen.getByRole("button", { name: "google" }));
    await screen.findByRole("button", { name: "redirecting" });

    act(() => {
      window.dispatchEvent(
        new PageTransitionEvent("pageshow", { persisted: false })
      );
    });

    expect(
      screen.getByRole("button", { name: "redirecting" })
    ).toBeDisabled();
  });

  it("shows the error and re-enables the button when the action fails", async () => {
    const user = userEvent.setup();
    mockGoogleSignInAction.mockResolvedValueOnce({
      ok: false,
      error: "Something went wrong",
    });

    render(<GoogleSignInButton />);
    await user.click(screen.getByRole("button", { name: "google" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Something went wrong"
    );
    expect(screen.getByRole("button", { name: "google" })).toBeEnabled();
    expect(mockAssign).not.toHaveBeenCalled();
  });

  it("shows a fallback error and re-enables the button when the action throws", async () => {
    const user = userEvent.setup();
    mockGoogleSignInAction.mockRejectedValueOnce(new Error("Network error"));

    render(<GoogleSignInButton />);
    await user.click(screen.getByRole("button", { name: "google" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "errors.unexpected"
    );
    expect(useTranslations).toHaveBeenCalledWith("auth.login");
    expect(screen.getByRole("button", { name: "google" })).toBeEnabled();
    expect(mockAssign).not.toHaveBeenCalled();
  });
});
