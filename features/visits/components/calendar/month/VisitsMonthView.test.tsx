import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useLocale, useTranslations } from "next-intl";
import type { CalendarWeek } from "../../../domain/visits-calendar-types";
import { VisitsMonthView } from "./VisitsMonthView";

vi.mock("next-intl", () => ({
  useLocale: vi.fn(),
  useTranslations: vi.fn(),
}));

const mockUseLocale = vi.mocked(useLocale);
const mockUseTranslations = vi.mocked(useTranslations);

function createWeek(startDay: number): CalendarWeek {
  return {
    key: `2026-04-${String(startDay).padStart(2, "0")}`,
    days: Array.from({ length: 7 }, (_, index) => {
      const dayNumber = startDay + index;
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

describe("VisitsMonthView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseLocale.mockReturnValue("en");
    mockUseTranslations.mockImplementation((namespace?: string) => {
      const prefix = namespace ? `${namespace}.` : "";

      return ((key: string) => `${prefix}${key}`) as ReturnType<
        typeof useTranslations
      >;
    });
  });

  it("uses grid semantics and moves selection with arrow keys", () => {
    const onSelectDay = vi.fn();

    render(
      <VisitsMonthView
        weeks={[createWeek(6)]}
        selectedDateIso="2026-04-08"
        draftRange={null}
        onSelectDay={onSelectDay}
      />,
    );

    const grid = screen.getByRole("grid", {
      name: "visits.calendar.monthGrid",
    });
    const buttons = screen.getAllByRole("button");
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

  it("keeps focusable navigation explicit even when no day is selected", () => {
    const onSelectDay = vi.fn();

    render(
      <VisitsMonthView
        weeks={[createWeek(6)]}
        selectedDateIso={null}
        draftRange={null}
        onSelectDay={onSelectDay}
      />,
    );

    const buttons = screen.getAllByRole("button");

    expect(buttons[0]).toHaveAttribute("tabindex", "0");
  });
});
