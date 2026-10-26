import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useLocale, useTranslations } from "next-intl";
import type {
  CalendarDay,
  CalendarSegment,
} from "../../../domain/visits-calendar-types";
import type { Visit, VisitStatus } from "../../../types/visits";
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

function createVisit(id: number, status: VisitStatus, visitorName: string): Visit {
  return {
    id,
    visitorName,
    dateFrom: "2026-04-08",
    dateTo: "2026-04-12",
    status,
    note: null,
    author: "Admin",
    authorId: "user-1",
    createdAt: "2026-04-01T10:00:00.000Z",
  };
}

function createTimelineRow(
  visit: Visit,
  overrides: Partial<CalendarSegment> = {},
) {
  return {
    segment: {
      key: `visit-${visit.id}`,
      visit,
      startIndex: 0,
      span: 3,
      continuesBefore: false,
      continuesAfter: false,
      ...overrides,
    },
    isStart: true,
    isEnd: true,
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

  it("does not encode visit status by colour in the timeline bars", () => {
    const statuses: VisitStatus[] = ["current", "upcoming", "past"];

    const barClassNames = statuses.map((status, index) => {
      const visitorName = `Visitor ${status}`;
      const visit = createVisit(index + 1, status, visitorName);
      const { unmount } = render(
        <VisitsMonthDayCell
          day={createDay({ visits: [visit] })}
          selectedDateIso={null}
          draftRange={null}
          timelineRows={[createTimelineRow(visit)]}
          tabIndex={-1}
          onSelectDay={vi.fn()}
        />,
      );

      const bar = screen.getByTitle(visitorName);
      const className = bar.className;

      unmount();

      return className;
    });

    expect(new Set(barClassNames).size).toBe(1);
  });

  it("darkens the timeline bar inside a draft range so it stays visible on the tint", () => {
    const visit = createVisit(1, "upcoming", "Eva Novak");

    function renderBarClassName(
      draftRange: { dateFrom: string; dateTo: string } | null,
    ) {
      const { unmount } = render(
        <VisitsMonthDayCell
          day={createDay({ visits: [visit] })}
          selectedDateIso={null}
          draftRange={draftRange}
          timelineRows={[createTimelineRow(visit)]}
          tabIndex={-1}
          onSelectDay={vi.fn()}
        />,
      );
      const className = screen.getByTitle("Eva Novak").className;

      unmount();

      return className;
    }

    const inRange = renderBarClassName({
      dateFrom: "2026-04-09",
      dateTo: "2026-04-11",
    });
    const outOfRange = renderBarClassName(null);

    expect(inRange).toContain("bg-border");
    expect(inRange).not.toContain("bg-muted");
    expect(outOfRange).toContain("bg-muted");
    expect(outOfRange).not.toContain("bg-border");
  });

  it.each([
    {
      state: "today",
      isToday: true,
      selectedDateIso: null,
      expected: ["bg-accent", "text-on-accent"],
      absent: ["ring-2"],
    },
    {
      state: "selected",
      isToday: false,
      selectedDateIso: "2026-04-10",
      expected: ["text-ink-primary"],
      absent: ["bg-accent", "ring-2"],
    },
    {
      state: "today and selected",
      isToday: true,
      selectedDateIso: "2026-04-10",
      expected: ["bg-accent", "text-on-accent"],
      absent: ["ring-2", "ring-offset-1"],
    },
  ])("styles the day numeral when $state", ({ isToday, selectedDateIso, expected, absent }) => {
    render(
      <VisitsMonthDayCell
        day={createDay({ isToday })}
        selectedDateIso={selectedDateIso}
        draftRange={null}
        timelineRows={[]}
        tabIndex={-1}
        onSelectDay={vi.fn()}
      />,
    );

    const numeral = screen.getByText("10");

    for (const className of expected) {
      expect(numeral).toHaveClass(className);
    }
    for (const className of absent) {
      expect(numeral).not.toHaveClass(className);
    }
  });

  it("does not render a standalone visit count next to the day numeral", () => {
    const visits = [
      createVisit(1, "current", "Eva Novak"),
      createVisit(2, "upcoming", "Tom Dvorak"),
    ];

    render(
      <VisitsMonthDayCell
        day={createDay({ visits })}
        selectedDateIso={null}
        draftRange={null}
        timelineRows={visits.map((visit) => createTimelineRow(visit))}
        tabIndex={-1}
        onSelectDay={vi.fn()}
      />,
    );

    expect(screen.queryByText("2")).not.toBeInTheDocument();
    expect(screen.getByRole("button")).toHaveAttribute(
      "aria-label",
      expect.stringContaining("visits.calendar.visitsCount:2"),
    );
  });

  it("marks interior draft-range days with a non-colour band and an accessible name", () => {
    render(
      <VisitsMonthDayCell
        day={createDay()}
        selectedDateIso={null}
        draftRange={{ dateFrom: "2026-04-09", dateTo: "2026-04-11" }}
        timelineRows={[]}
        tabIndex={-1}
        onSelectDay={vi.fn()}
      />,
    );

    const button = screen.getByRole("button");

    expect(button.className).toContain(
      "shadow-[inset_0_2px_0_var(--color-accent),inset_0_-2px_0_var(--color-accent)]",
    );
    expect(button).toHaveAttribute(
      "aria-label",
      expect.stringContaining("visits.calendar.inDraftRange"),
    );
  });

  it("leaves days outside the draft range without the band or range label", () => {
    render(
      <VisitsMonthDayCell
        day={createDay()}
        selectedDateIso={null}
        draftRange={{ dateFrom: "2026-04-12", dateTo: "2026-04-14" }}
        timelineRows={[]}
        tabIndex={-1}
        onSelectDay={vi.fn()}
      />,
    );

    const button = screen.getByRole("button");

    expect(button.className).not.toContain("shadow-[inset");
    expect(button).toHaveAttribute(
      "aria-label",
      expect.not.stringContaining("visits.calendar.inDraftRange"),
    );
  });

  it.each([
    { state: "selected", draftRange: null },
    {
      state: "selected draft boundary",
      draftRange: { dateFrom: "2026-04-10", dateTo: "2026-04-12" },
    },
  ])("keeps the cell ring on a $state day", ({ draftRange }) => {
    render(
      <VisitsMonthDayCell
        day={createDay()}
        selectedDateIso="2026-04-10"
        draftRange={draftRange}
        timelineRows={[]}
        tabIndex={-1}
        onSelectDay={vi.fn()}
      />,
    );

    const button = screen.getByRole("button");

    expect(button).toHaveClass("ring-2", "ring-inset", "ring-accent");
    expect(button.className).not.toContain("shadow-[inset");
  });

  it("draws the focus outline inside the selection ring so focus stays visible on a selected day", () => {
    render(
      <VisitsMonthDayCell
        day={createDay()}
        selectedDateIso="2026-04-10"
        draftRange={null}
        timelineRows={[]}
        tabIndex={0}
        onSelectDay={vi.fn()}
      />,
    );

    const button = screen.getByRole("button");

    expect(button).toHaveClass("focus-visible:-outline-offset-6");
    expect(button).not.toHaveClass("focus-inset");
  });

  it("keeps one button per cell with hidden bars, continuation markers and overflow", () => {
    const visits = [
      createVisit(1, "current", "Eva Novak"),
      createVisit(2, "upcoming", "Tom Dvorak"),
      createVisit(3, "past", "Jana Mala"),
    ];

    render(
      <VisitsMonthDayCell
        day={createDay({ visits })}
        selectedDateIso={null}
        draftRange={{ dateFrom: "2026-04-10", dateTo: "2026-04-12" }}
        timelineRows={[
          createTimelineRow(visits[0], { continuesBefore: true }),
          createTimelineRow(visits[1], { continuesAfter: true }),
          createTimelineRow(visits[2]),
        ]}
        tabIndex={-1}
        onSelectDay={vi.fn()}
      />,
    );

    const button = screen.getByRole("button");

    expect(screen.getAllByRole("button")).toHaveLength(1);
    expect(button).toHaveAttribute("data-day-iso", "2026-04-10");
    expect(button).not.toHaveAttribute("aria-current");
    expect(button).toHaveAttribute(
      "aria-label",
      expect.stringContaining("visits.calendar.visitsCount:3"),
    );
    expect(screen.getByTitle("... Eva Novak")).toHaveTextContent(
      "... Eva Novak",
    );
    expect(screen.getByTitle("Tom Dvorak ...")).toHaveTextContent(
      "Tom Dvorak ...",
    );
    expect(screen.queryByTitle("Jana Mala")).not.toBeInTheDocument();
    expect(button).toHaveTextContent("+1");
    expect(screen.getByTitle("... Eva Novak").closest("[aria-hidden]")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });
});
