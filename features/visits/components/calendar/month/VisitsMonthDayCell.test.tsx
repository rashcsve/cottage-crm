import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useLocale, useTranslations } from "next-intl";
import type { CalendarDay } from "../../../domain/visits-calendar-types";
import { VisitsMonthDayCell } from "./VisitsMonthDayCell";

vi.mock("next-intl", () => ({
  useLocale: vi.fn(),
  useTranslations: vi.fn(),
}));

const mockUseLocale = vi.mocked(useLocale);
const mockUseTranslations = vi.mocked(useTranslations);

function createDay(overrides: Partial<CalendarDay> = {}): CalendarDay {
  return {
    iso: "2026-04-10",
    date: new Date(Date.UTC(2026, 3, 10)),
    inCurrentMonth: true,
    isToday: false,
    visits: [],
    ...overrides,
  };
}

describe("VisitsMonthDayCell", () => {
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

  it("emits one explicit selection payload for current-month clicks", () => {
    const onSelectDay = vi.fn();

    render(
      <VisitsMonthDayCell
        day={createDay()}
        selectedDateIso="2026-04-12"
        draftRange={null}
        timelineRows={[]}
        tabIndex={-1}
        onSelectDay={onSelectDay}
      />,
    );

    fireEvent.click(screen.getByRole("button"));

    expect(onSelectDay).toHaveBeenCalledWith({
      iso: "2026-04-10",
      extendRange: false,
    });
  });

  it("keeps selected-day semantics explicit without leaking month-specific state", () => {
    const onSelectDay = vi.fn();

    render(
      <VisitsMonthDayCell
        day={createDay({
          inCurrentMonth: false,
          isToday: true,
          visits: [
            {
              id: 1,
              visitorName: "Eva Novak",
              dateFrom: "2026-04-10",
              dateTo: "2026-04-12",
              status: "upcoming",
              note: null,
              author: "Admin",
              authorId: "user-1",
              createdAt: "2026-04-01T10:00:00.000Z",
            },
          ],
        })}
        selectedDateIso="2026-04-10"
        draftRange={null}
        timelineRows={[
          {
            segment: {
              key: "visit-1",
              visit: {
                id: 1,
                visitorName: "Eva Novak",
                dateFrom: "2026-04-10",
                dateTo: "2026-04-12",
                status: "upcoming",
                note: null,
                author: "Admin",
                authorId: "user-1",
                createdAt: "2026-04-01T10:00:00.000Z",
              },
              startIndex: 0,
              span: 3,
              continuesBefore: false,
              continuesAfter: false,
            },
            isStart: true,
            isEnd: false,
          },
        ]}
        tabIndex={0}
        onSelectDay={onSelectDay}
      />,
    );

    const button = screen.getByRole("button");
    const gridCell = button.closest('[role="gridcell"]');

    fireEvent.click(button, { shiftKey: true });

    expect(onSelectDay).toHaveBeenCalledWith({
      iso: "2026-04-10",
      extendRange: true,
    });
    expect(button).toHaveAttribute("aria-current", "date");
    expect(button).not.toHaveAttribute("aria-pressed");
    expect(button).toHaveAttribute("tabindex", "0");
    expect(gridCell).toHaveAttribute("aria-selected", "true");
    expect(button).toHaveAttribute(
      "aria-label",
      expect.stringContaining("visits.calendar.selectedDay"),
    );
    expect(button).toHaveTextContent("1");
    expect(button).toHaveTextContent("Eva Novak");
  });
});
