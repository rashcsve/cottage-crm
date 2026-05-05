import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useLocale } from "next-intl";

import { usePathname, useRouter } from "@/i18n/navigation";

import { LanguageSwitcher } from "./LanguageSwitcher";

vi.mock("next-intl", () => ({
  useLocale: vi.fn(),
}));

vi.mock("@/i18n/navigation", () => ({
  usePathname: vi.fn(),
  useRouter: vi.fn(),
}));

const mockUseLocale = vi.mocked(useLocale);
const mockUsePathname = vi.mocked(usePathname);
const mockUseRouter = vi.mocked(useRouter);

describe("LanguageSwitcher", () => {
  const replace = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseLocale.mockReturnValue("cs");
    mockUsePathname.mockReturnValue("/overview");
    mockUseRouter.mockReturnValue({
      replace,
    } as unknown as ReturnType<typeof useRouter>);
  });

  it("renders a grouped switcher with accessible language names", () => {
    render(<LanguageSwitcher ariaLabel="Switch language" />);

    expect(
      screen.getByRole("group", { name: "Switch language" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Čeština" })
    ).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.getByRole("button", { name: "English" })
    ).toHaveAttribute("aria-pressed", "false");
  });

  it("switches locale when the other language is selected", async () => {
    const user = userEvent.setup();

    render(<LanguageSwitcher ariaLabel="Switch language" size="compact" />);

    await user.click(screen.getByRole("button", { name: "English" }));

    expect(replace).toHaveBeenCalledWith("/overview", { locale: "en" });
  });
});
