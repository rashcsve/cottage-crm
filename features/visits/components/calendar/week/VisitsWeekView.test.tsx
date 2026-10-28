import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useLocale, useTranslations } from "next-intl";
import type {
  CalendarDay,
  CalendarWeek,
} from "../../../domain/visits-calendar-types";
import type { Visit, VisitStatus } from "../../../types/visits";
import { VisitsWeekView } from "./VisitsWeekView";

const FORBIDDEN_CLASS_PATTERNS = [
  /\b(?:[a-z-]+:)*(?:bg|text|border|ring|from|to|via|outline|divide|fill|stroke)-(?:stone|amber|emerald|sky|rose|red|green|yellow|slate|gray|zinc|neutral|white|black)\b/,
  /focus-visible:outline-none/,
  /text-\[\d+px\]/,
  /(?:^|\s)(?:[a-z-]+:)*shadow-/,
  /rounded-(?:lg|xl|2xl|3xl|4xl)\b/,
];

function createVisit(id: number, status: VisitStatus, visitorName: string): Visit {
  return {
    id,
    visitorName,
    couple: "couple-1",
    coupleLabel: null,
    dateFrom: "2026-04-07",
    dateTo: "2026-04-09",
    status,
    note: null,
    author: "Admin",
    authorId: "user-1",
    createdAt: "2026-04-01T10:00:00.000Z",
  };
}

function createWeekWithVisits(): CalendarWeek {
  const week = createWeek();
  const visits = [
    createVisit(1, "current", "Eva Novak"),
    createVisit(2, "upcoming", "Tom Dvorak"),
    createVisit(3, "past", "Jana Mala"),
  ];

  return {
    ...week,
    days: week.days.map((day, index): CalendarDay => ({
      ...day,
      isToday: index === 1,
      visits: index >= 1 && index <= 3 ? visits : [],
    })),
    rows: visits.map((visit) => [
      {
        key: `visit-${visit.id}`,
        visit,
        startIndex: 1,
        span: 3,
        continuesBefore: false,
        continuesAfter: false,
      },
    ]),
  };
}

function getAllClassNames(container: HTMLElement): string[] {
  return Array.from(container.querySelectorAll<HTMLElement>("[class]")).map(
    (element) => element.getAttribute("class") ?? "",
  );
}

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
        selectedDateIso="2026-04-08"
        draftRange={null}
        canManageVisits={false}
        isDraftMode={false}
        onAddVisit={vi.fn()}
        onSelectDay={onSelectDay}
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
        selectedDateIso="2026-04-08"
        draftRange={null}
        canManageVisits={false}
        isDraftMode={false}
        onAddVisit={vi.fn()}
        onSelectDay={onSelectDay}
      />,
    );

    const mobile = screen.getByTestId("week-mobile-view");
    const dayPicker = within(mobile).getByRole("group", {
      name: "visits.calendar.weekDayPicker",
    });
    const tabs = within(dayPicker).getAllByRole("button");
    const selectedTab = tabs[2];

    expect(within(mobile).getByText("visits.calendar.visitsCount:0")).toBeInTheDocument();
    expect(selectedTab).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(tabs[4]!);

    expect(onSelectDay).toHaveBeenCalledWith({
      iso: "2026-04-10",
      extendRange: false,
    });
  });

  it("offers one mobile add action that opens the composer for the selected day", () => {
    const onAddVisit = vi.fn();

    render(
      <VisitsWeekView
        week={createWeekWithVisits()}
        selectedDateIso="2026-04-08"
        draftRange={null}
        canManageVisits={true}
        isDraftMode={false}
        onAddVisit={onAddVisit}
        onSelectDay={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    const mobile = screen.getByTestId("week-mobile-view");
    const addButtons = within(mobile).getAllByRole("button", {
      name: /visits\.calendar\.(?:planStayOnDay|addVisitOnDay)/,
    });

    expect(addButtons).toHaveLength(1);

    fireEvent.click(addButtons[0]!);

    expect(onAddVisit).toHaveBeenCalledWith("2026-04-08");
  });

  it("lets an open draft move to another day by clicking the day content", () => {
    const onSelectDay = vi.fn();

    render(
      <VisitsWeekView
        week={createWeek()}
        selectedDateIso="2026-04-08"
        draftRange={null}
        canManageVisits={true}
        isDraftMode={true}
        onAddVisit={vi.fn()}
        onSelectDay={onSelectDay}
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
        selectedDateIso={null}
        draftRange={null}
        canManageVisits={true}
        isDraftMode={false}
        onAddVisit={vi.fn()}
        onSelectDay={vi.fn()}
      />,
    );

    expect(screen.getByText("visits.calendar.chooseDayTitle")).toBeInTheDocument();
    expect(
      screen.getByText("visits.calendar.chooseDayDescription"),
    ).toBeInTheDocument();
  });

  it.each([
    { state: "browsing", isDraftMode: false, draftRange: null },
    {
      state: "editing a draft",
      isDraftMode: true,
      draftRange: { dateFrom: "2026-04-07", dateTo: "2026-04-09" },
    },
  ])("uses only Fjäll tokens while $state", ({ isDraftMode, draftRange }) => {
    const { container } = render(
      <VisitsWeekView
        week={createWeekWithVisits()}
        selectedDateIso="2026-04-08"
        draftRange={draftRange}
        canManageVisits={true}
        isDraftMode={isDraftMode}
        onAddVisit={vi.fn()}
        onSelectDay={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    const offending = getAllClassNames(container).filter((className) =>
      FORBIDDEN_CLASS_PATTERNS.some((pattern) => pattern.test(className)),
    );

    expect(offending).toEqual([]);
  });

  it("keeps the desktop button count per day column", () => {
    render(
      <VisitsWeekView
        week={createWeek()}
        selectedDateIso="2026-04-08"
        draftRange={null}
        canManageVisits={true}
        isDraftMode={false}
        onAddVisit={vi.fn()}
        onSelectDay={vi.fn()}
      />,
    );

    const desktop = screen.getByTestId("week-desktop-view");
    const cells = within(desktop).getAllByRole("gridcell");

    expect(cells).toHaveLength(7);
    for (const cell of cells) {
      expect(within(cell).getAllByRole("button")).toHaveLength(2);
    }
  });

  it("marks today on the desktop view as the current date", () => {
    render(
      <VisitsWeekView
        week={createWeekWithVisits()}
        selectedDateIso="2026-04-09"
        draftRange={null}
        canManageVisits={false}
        isDraftMode={false}
        onAddVisit={vi.fn()}
        onSelectDay={vi.fn()}
      />,
    );

    const desktop = screen.getByTestId("week-desktop-view");

    expect(
      desktop.querySelector('button[data-day-iso="2026-04-07"]'),
    ).toHaveAttribute("aria-current", "date");
  });

  it("names draft-range days and marks them with a non-colour band", () => {
    render(
      <VisitsWeekView
        week={createWeek()}
        selectedDateIso="2026-04-11"
        draftRange={{ dateFrom: "2026-04-07", dateTo: "2026-04-09" }}
        canManageVisits={true}
        isDraftMode={true}
        onAddVisit={vi.fn()}
        onSelectDay={vi.fn()}
      />,
    );

    const desktop = screen.getByTestId("week-desktop-view");
    const inRange = desktop.querySelector('button[data-day-iso="2026-04-08"]');
    const outOfRange = desktop.querySelector(
      'button[data-day-iso="2026-04-10"]',
    );

    expect(inRange).toHaveAttribute(
      "aria-label",
      expect.stringContaining("visits.calendar.inDraftRange"),
    );
    expect(inRange?.parentElement).toHaveClass("range-band");
    expect(outOfRange).toHaveAttribute(
      "aria-label",
      expect.not.stringContaining("visits.calendar.inDraftRange"),
    );
    expect(outOfRange?.parentElement).not.toHaveClass("range-band");
  });

  it("marks the selected and current days in the mobile strip", () => {
    render(
      <VisitsWeekView
        week={createWeekWithVisits()}
        selectedDateIso="2026-04-08"
        draftRange={null}
        canManageVisits={false}
        isDraftMode={false}
        onAddVisit={vi.fn()}
        onSelectDay={vi.fn()}
      />,
    );

    const mobile = screen.getByTestId("week-mobile-view");
    const dayPicker = within(mobile).getByRole("group", {
      name: "visits.calendar.weekDayPicker",
    });
    const tabs = within(dayPicker).getAllByRole("button");

    expect(tabs[2]).toHaveAttribute("aria-pressed", "true");
    expect(tabs[4]).toHaveAttribute("aria-pressed", "false");
    expect(tabs[1]).toHaveAttribute("aria-current", "date");
  });

  it.each([
    { key: "ArrowLeft", targetIndex: 1, iso: "2026-04-07" },
    { key: "ArrowRight", targetIndex: 3, iso: "2026-04-09" },
    { key: "Home", targetIndex: 0, iso: "2026-04-06" },
    { key: "End", targetIndex: 6, iso: "2026-04-12" },
  ])("moves mobile day selection and focus with $key", ({ key, targetIndex, iso }) => {
    const onSelectDay = vi.fn();

    render(
      <VisitsWeekView
        week={createWeekWithVisits()}
        selectedDateIso="2026-04-08"
        draftRange={null}
        canManageVisits={false}
        isDraftMode={false}
        onAddVisit={vi.fn()}
        onSelectDay={onSelectDay}
      />,
    );

    const mobile = screen.getByTestId("week-mobile-view");
    const picker = within(mobile).getByRole("group", {
      name: "visits.calendar.weekDayPicker",
    });
    const days = within(picker).getAllByRole("button");

    days[2].focus();
    fireEvent.keyDown(days[2], { key });

    expect(onSelectDay).toHaveBeenCalledTimes(1);
    expect(onSelectDay).toHaveBeenCalledWith({ iso, extendRange: false });
    expect(days[targetIndex]).toHaveFocus();
  });
});
