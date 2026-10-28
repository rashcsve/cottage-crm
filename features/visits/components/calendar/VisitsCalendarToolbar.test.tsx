import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import type { VisitsCalendarView } from "../../domain/visits-calendar-types";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useTranslations } from "next-intl";
import csMessages from "@/i18n/locales/cs.json";
import enMessages from "@/i18n/locales/en.json";
import { VisitsCalendarToolbar } from "./VisitsCalendarToolbar";

vi.mock("next-intl", () => ({
  useTranslations: vi.fn(),
}));

const mockUseTranslations = vi.mocked(useTranslations);

function mockDesktopViewport() {
  const query = "(min-width: 64rem)";
  vi.mocked(window.matchMedia).mockReturnValue({
    ...window.matchMedia(query),
    matches: true,
  });
}

function renderToolbar(
  overrides: Partial<Parameters<typeof VisitsCalendarToolbar>[0]> = {},
) {
  const props = {
    anchorLabel: "October 2026",
    view: "month" as const,
    summary: { current: 1, upcoming: 3 },
    onViewChange: vi.fn(),
    onPrevious: vi.fn(),
    onNext: vi.fn(),
    onToday: vi.fn(),
    ...overrides,
  };

  render(<VisitsCalendarToolbar {...props} />);

  return props;
}

describe("VisitsCalendarToolbar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(window.matchMedia).mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    mockUseTranslations.mockImplementation((namespace?: string) => {
      const prefix = namespace ? `${namespace}.` : "";

      return ((key: string, values?: Record<string, string | number>) => {
        if (!values) {
          return `${prefix}${key}`;
        }

        return `${prefix}${key}:${Object.values(values).join(" | ")}`;
      }) as ReturnType<typeof useTranslations>;
    });
  });

  it("announces the period label as a live heading", () => {
    renderToolbar();

    const heading = screen.getByRole("heading", { name: "October 2026" });
    expect(heading).toHaveAttribute("aria-live", "polite");
  });

  it("uses the compact week label on mobile", () => {
    const props = { view: "week" as const, mobileAnchorLabel: "5.–11. 4. 2026" };
    renderToolbar(props);

    expect(screen.getByRole("heading", { name: props.mobileAnchorLabel }))
      .toHaveAttribute("aria-live", "polite");
  });

  it("keeps the month and year when a compact week label is also supplied", () => {
    renderToolbar({
      view: "month",
      anchorLabel: "April 2026",
      mobileAnchorLabel: "Apr 5–11, 2026",
    });

    expect(screen.getByRole("heading", { name: "April 2026" }))
      .toHaveAttribute("aria-live", "polite");
  });

  it("groups previous, today and next in the navigation group", () => {
    mockDesktopViewport();
    const props = renderToolbar();

    const navigation = screen.getByRole("group", {
      name: "visits.calendar.navigation",
    });

    fireEvent.click(
      within(navigation).getByRole("button", {
        name: "visits.calendar.previous",
      }),
    );
    fireEvent.click(
      within(navigation).getByRole("button", { name: "visits.calendar.today" }),
    );
    fireEvent.click(
      within(navigation).getByRole("button", { name: "visits.calendar.next" }),
    );

    expect(props.onPrevious).toHaveBeenCalledTimes(1);
    expect(props.onToday).toHaveBeenCalledTimes(1);
    expect(props.onNext).toHaveBeenCalledTimes(1);
  });

  it("marks the active view as pressed and only switches to another view", () => {
    const props = renderToolbar({ view: "week" });

    const switcher = screen.getByRole("group", {
      name: "visits.calendar.viewSwitcher",
    });
    const week = within(switcher).getByRole("button", {
      name: "visits.calendar.week",
    });
    const agenda = within(switcher).getByRole("button", {
      name: "visits.calendar.agenda",
    });

    expect(week).toHaveAttribute("aria-pressed", "true");
    expect(agenda).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(week);
    fireEvent.click(agenda);

    expect(props.onViewChange).toHaveBeenCalledTimes(1);
    expect(props.onViewChange).toHaveBeenCalledWith("agenda");
  });

  it("keeps focus on the activated view when entering and leaving mobile week view", async () => {
    function StatefulToolbar() {
      const [view, setView] = useState<VisitsCalendarView>("month");
      return (
        <VisitsCalendarToolbar
          anchorLabel="April 2026"
          view={view}
          summary={{ current: 0, upcoming: 0 }}
          onViewChange={setView}
          onPrevious={vi.fn()}
          onNext={vi.fn()}
          onToday={vi.fn()}
        />
      );
    }
    const user = userEvent.setup();
    render(<StatefulToolbar />);

    for (const view of ["week", "month", "week", "agenda", "week"]) {
      screen.getByRole("button", { name: `visits.calendar.${view}` }).focus();
      await user.keyboard("{Enter}");

      const selected = screen.getByRole("button", { name: `visits.calendar.${view}` });
      expect(selected).toHaveAttribute("aria-pressed", "true");
      expect(selected).toHaveFocus();
    }
  });

  it("follows the week toolbar reading order when tabbing through controls", async () => {
    const user = userEvent.setup();
    renderToolbar({ view: "week", anchorLabel: "2–8 November 2026" });

    for (const key of ["month", "week", "agenda", "today", "previous", "next"]) {
      await user.tab();

      expect(
        screen.getByRole("button", { name: `visits.calendar.${key}` }),
      ).toHaveFocus();
    }
  });

  it("uses the same keyboard order for mobile month and week controls", async () => {
    const user = userEvent.setup();
    renderToolbar({ view: "month" });

    for (const key of ["month", "week", "agenda", "today", "previous", "next"]) {
      await user.tab();

      expect(
        screen.getByRole("button", { name: `visits.calendar.${key}` }),
      ).toHaveFocus();
    }
  });

  it("uses the compact calendar keyboard order for mobile agenda", async () => {
    const user = userEvent.setup();
    renderToolbar({ view: "agenda" });

    for (const key of ["month", "week", "agenda", "today", "previous", "next"]) {
      await user.tab();
      expect(screen.getByRole("button", { name: `visits.calendar.${key}` }))
        .toHaveFocus();
    }
  });

  it.each(["week", "month", "agenda"] as const)("preserves desktop %s navigation focus order", async (view) => {
    mockDesktopViewport();
    const user = userEvent.setup();
    renderToolbar({ view, mobileAnchorLabel: "5.–11. 4. 2026" });

    expect(screen.getByRole("heading", { name: "October 2026" }))
      .toBeInTheDocument();

    for (const key of ["previous", "today", "next", "month", "week", "agenda"]) {
      await user.tab();

      expect(
        screen.getByRole("button", { name: `visits.calendar.${key}` }),
      ).toHaveFocus();
    }
  });

  it("updates the week toolbar when crossing the desktop breakpoint", () => {
    let isDesktop = false;
    const mediaEvents = new EventTarget();
    vi.mocked(window.matchMedia).mockImplementation((query: string) => ({
      get matches() { return isDesktop; },
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: mediaEvents.addEventListener.bind(mediaEvents),
      removeEventListener: mediaEvents.removeEventListener.bind(mediaEvents),
      dispatchEvent: mediaEvents.dispatchEvent.bind(mediaEvents),
    }));
    const props = renderToolbar({ view: "week" });
    const getNavigation = () => screen.getByRole("group", {
      name: "visits.calendar.navigation",
    });

    expect(within(getNavigation()).queryByRole("button", {
      name: "visits.calendar.today",
    })).not.toBeInTheDocument();

    act(() => {
      isDesktop = true;
      mediaEvents.dispatchEvent(new Event("change"));
    });

    fireEvent.click(within(getNavigation()).getByRole("button", {
      name: "visits.calendar.today",
    }));
    expect(props.onToday).toHaveBeenCalledTimes(1);
    expect(screen.getAllByRole("button")).toHaveLength(6);

    act(() => {
      isDesktop = false;
      mediaEvents.dispatchEvent(new Event("change"));
    });

    expect(within(getNavigation()).queryByRole("button", {
      name: "visits.calendar.today",
    })).not.toBeInTheDocument();
    expect(screen.getByRole("button", {
      name: "visits.calendar.week",
    })).toHaveAttribute("aria-pressed", "true");
    expect(props.onViewChange).not.toHaveBeenCalled();
  });

  it("states the summary as one sentence instead of a list of pills", () => {
    mockDesktopViewport();
    renderToolbar({ summary: { current: 1, upcoming: 3 } });

    const hereNow = screen.getByText("visits.calendar.summaryHereNow:1");
    const upcoming = screen.getByText("visits.calendar.summaryUpcoming:3");

    expect(hereNow.closest("p")).not.toBeNull();
    expect(hereNow.closest("p")).toBe(upcoming.closest("p"));
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("passes zero counts through to the summary", () => {
    mockDesktopViewport();
    renderToolbar({ summary: { current: 0, upcoming: 0 } });

    expect(
      screen.getByText("visits.calendar.summaryHereNow:0"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("visits.calendar.summaryUpcoming:0"),
    ).toBeInTheDocument();
  });

  it("has only navigation and view buttons, the same in every view", () => {
    renderToolbar({ view: "agenda" });

    expect(screen.getAllByRole("button")).toHaveLength(6);
  });
});

describe("toolbar summary copy", () => {
  async function createTranslatorFor(locale: "cs" | "en") {
    const { createTranslator } =
      await vi.importActual<typeof import("next-intl")>("next-intl");
    const messages = locale === "cs" ? csMessages : enMessages;

    return createTranslator({
      locale,
      messages,
      namespace: "visits.calendar",
    });
  }

  it.each([
    [0, "0 návštěv teď na chatě", "0 plánovaných"],
    [1, "1 návštěva teď na chatě", "1 plánovaná"],
    [3, "3 návštěvy teď na chatě", "3 plánované"],
    [5, "5 návštěv teď na chatě", "5 plánovaných"],
  ])("pluralises the Czech summary for %i", async (count, hereNow, upcoming) => {
    const t = await createTranslatorFor("cs");

    expect(t("summaryHereNow", { count })).toBe(hereNow);
    expect(t("summaryUpcoming", { count })).toBe(upcoming);
  });

  it("states zero counts in English", async () => {
    const t = await createTranslatorFor("en");

    expect(t("summaryHereNow", { count: 0 })).toBe("0 here now");
    expect(t("summaryUpcoming", { count: 0 })).toBe("0 upcoming");
  });
});
