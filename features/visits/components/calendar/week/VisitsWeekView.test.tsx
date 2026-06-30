import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useLocale, useTranslations } from "next-intl";
import type { CalendarWeek } from "../../../domain/visits-calendar-types";
import { VisitsWeekView } from "./VisitsWeekView";

vi.mock("next-intl", () => ({
  useLocale: vi.fn(),
  useTranslations: vi.fn(),
}));

const mockUseLocale = vi.mocked(useLocale);
const mockUseTranslations = vi.mocked(useTranslations);

function createWeek(): CalendarWeek {
  return {
    key: "2026-04-06",
    days: Array.from({ length: 7 }, (_, index) => {
      const dayNumber = 6 + index;
      const iso = `2026-04-${String(dayNumber).padStart(2, "0")}`;

      return {
        iso,
        date: new Date(Date.UTC(2026, 3, dayNumber)),
        inCurrentMonth: true,
        isToday: false,
        visits: [],
      };
    }),
    rows: [],
  };
}

describe("VisitsWeekView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseLocale.mockReturnValue("en");
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

  it("uses desktop grid semantics and moves selection with arrow keys", () => {
    const onSelectDay = vi.fn();

    render(
      <VisitsWeekView
        week={createWeek()}
        anchorLabel="Apr 6 – 12, 2026"
        selectedDateIso="2026-04-08"
        draftRange={null}
        canManageVisits={false}
        isDraftMode={false}
        onAddVisit={vi.fn()}
        onSelectDay={onSelectDay}
        onPreviousWeek={vi.fn()}
        onNextWeek={vi.fn()}
      />,
    );

    const desktop = screen.getByTestId("week-desktop-view");
    const grid = within(desktop).getByRole("grid", {
      name: "visits.calendar.weekGrid",
    });
    const buttons = within(desktop).getAllByRole("button");
    const selectedButton = buttons[2];
    const nextButton = buttons[3];

    expect(selectedButton).toBeDefined();
    expect(nextButton).toBeDefined();

    selectedButton.focus();
    fireEvent.keyDown(selectedButton, { key: "ArrowRight" });

    expect(grid).toHaveAttribute("aria-describedby");
    expect(onSelectDay).toHaveBeenCalledWith({
      iso: "2026-04-09",
      extendRange: false,
    });
    expect(nextButton).toHaveFocus();
  });

  it("uses a mobile day picker with one selected-day panel", () => {
    const onSelectDay = vi.fn();

    render(
      <VisitsWeekView
        week={createWeek()}
        anchorLabel="Apr 6 – 12, 2026"
        selectedDateIso="2026-04-08"
        draftRange={null}
        canManageVisits={false}
        isDraftMode={false}
        onAddVisit={vi.fn()}
        onSelectDay={onSelectDay}
        onPreviousWeek={vi.fn()}
        onNextWeek={vi.fn()}
      />,
    );

    const mobile = screen.getByTestId("week-mobile-view");
    const dayPicker = within(mobile).getByRole("group", {
      name: "visits.calendar.weekDayPicker",
    });
    const tabs = within(dayPicker).getAllByRole("button");
    const selectedTab = tabs[2];

    expect(within(mobile).getByText("visits.calendar.selectedDay")).toBeInTheDocument();
    expect(selectedTab).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(tabs[4]!);

    expect(onSelectDay).toHaveBeenCalledWith({
      iso: "2026-04-10",
      extendRange: false,
    });
  });

  it("lets an open draft move to another day by clicking the day content", () => {
    const onSelectDay = vi.fn();

    render(
      <VisitsWeekView
        week={createWeek()}
        anchorLabel="Apr 6 – 12, 2026"
        selectedDateIso="2026-04-08"
        draftRange={null}
        canManageVisits={true}
        isDraftMode={true}
        onAddVisit={vi.fn()}
        onSelectDay={onSelectDay}
        onPreviousWeek={vi.fn()}
        onNextWeek={vi.fn()}
      />,
    );

    const desktop = screen.getByTestId("week-desktop-view");

    fireEvent.click(within(desktop).getAllByText("visits.calendar.noVisitsShort")[0]!, {
      shiftKey: true,
    });

    expect(onSelectDay).toHaveBeenCalledWith({
      iso: "2026-04-06",
      extendRange: true,
    });
  });

  it("shows a neutral mobile panel when no day is selected", () => {
    render(
      <VisitsWeekView
        week={createWeek()}
        anchorLabel="Apr 6 – 12, 2026"
        selectedDateIso={null}
        draftRange={null}
        canManageVisits={true}
        isDraftMode={false}
        onAddVisit={vi.fn()}
        onSelectDay={vi.fn()}
        onPreviousWeek={vi.fn()}
        onNextWeek={vi.fn()}
      />,
    );

    expect(screen.getByText("visits.calendar.chooseDayTitle")).toBeInTheDocument();
    expect(
      screen.getByText("visits.calendar.chooseDayDescription"),
    ).toBeInTheDocument();
  });

  it("keeps local week navigation controls inside the card", () => {
    const onPreviousWeek = vi.fn();
    const onNextWeek = vi.fn();

    render(
      <VisitsWeekView
        week={createWeek()}
        anchorLabel="Apr 6 – 12, 2026"
        selectedDateIso={null}
        draftRange={null}
        canManageVisits={false}
        isDraftMode={false}
        onAddVisit={vi.fn()}
        onSelectDay={vi.fn()}
        onPreviousWeek={onPreviousWeek}
        onNextWeek={onNextWeek}
      />,
    );

    expect(screen.getByText("Apr 6 – 12, 2026")).toBeInTheDocument();

    const navButtons = screen.getAllByRole("button", {
      name: /visits\.calendar\.(previous|next)/,
    });

    fireEvent.click(navButtons[0]!);
    fireEvent.click(navButtons[1]!);

    expect(onPreviousWeek).toHaveBeenCalled();
    expect(onNextWeek).toHaveBeenCalled();
  });
});
