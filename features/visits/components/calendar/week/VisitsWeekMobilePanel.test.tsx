import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useLocale, useTranslations } from "next-intl";
import { VisitsWeekMobilePanel } from "./VisitsWeekMobilePanel";
import { formatVisitFullDate } from "../../../shared/formatVisitDate";
import type { CalendarDay } from "../../../domain/visits-calendar-types";
import type { Visit } from "../../../types/visits";

vi.mock("next-intl", () => ({
  useLocale: vi.fn(),
  useTranslations: vi.fn(),
}));

const mockUseLocale = vi.mocked(useLocale);
const mockUseTranslations = vi.mocked(useTranslations);

const DATE_ISO = "2026-04-10";

function createVisit(overrides: Partial<Visit> = {}): Visit {
  return {
    id: 1,
    visitorName: "Eva Novak",
    couple: "couple-1",
    coupleLabel: null,
    dateFrom: "2026-04-10",
    dateTo: "2026-04-12",
    status: "upcoming",
    note: null,
    author: "Admin",
    authorId: "user-1",
    createdAt: "2026-04-01T10:00:00.000Z",
    ...overrides,
  };
}

function createDay(visits: Visit[] = []): CalendarDay {
  return {
    iso: DATE_ISO,
    date: new Date(2026, 3, 10),
    inCurrentMonth: true,
    isToday: false,
    visits,
  };
}

function renderPanel(
  overrides: Partial<Parameters<typeof VisitsWeekMobilePanel>[0]> = {},
) {
  const props = {
    day: createDay(),
    isDraftMode: false,
    canManageVisits: true,
    onAddVisit: vi.fn(),
    onDelete: vi.fn(),
    ...overrides,
  };

  render(<VisitsWeekMobilePanel {...props} />);

  return props;
}

describe("VisitsWeekMobilePanel", () => {
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

  it("asks to choose a day when none is selected", () => {
    renderPanel({ day: null });

    expect(
      screen.getByRole("heading", { name: "visits.calendar.chooseDayTitle" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("visits.calendar.chooseDayDescription"),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("lets admins plan a stay on the selected day with a single add action", () => {
    const dateLabel = formatVisitFullDate(createDay().date, "en");
    const props = renderPanel();

    expect(
      screen.getByRole("heading", { name: dateLabel }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("visits.calendar.visitsCount:0"),
    ).toBeInTheDocument();

    const addButtons = screen.getAllByRole("button", {
      name: `visits.calendar.planStayOnDay:${dateLabel}`,
    });

    expect(addButtons).toHaveLength(1);
    expect(addButtons[0]).toHaveTextContent("visits.calendar.planStay");

    fireEvent.click(addButtons[0]!);

    expect(props.onAddVisit).toHaveBeenCalledWith(DATE_ISO);
    expect(
      screen.getByText("visits.calendar.noVisitsDescription"),
    ).toBeInTheDocument();
  });

  it("counts the selected day's visit records", () => {
    renderPanel({
      day: createDay([createVisit(), createVisit({ id: 2, visitorName: "Tom" })]),
    });

    expect(
      screen.getByText("visits.calendar.visitsCount:2"),
    ).toBeInTheDocument();
  });

  it("shows read-only empty copy and no add action for viewers", () => {
    renderPanel({ isDraftMode: false, canManageVisits: false });

    expect(
      screen.queryByRole("button", { name: /planStayOnDay/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText("visits.calendar.noVisitsDescriptionReadOnly"),
    ).toBeInTheDocument();
  });

  it("keeps the add button while a draft is open so focus can return to it", () => {
    const props = renderPanel({ isDraftMode: true, canManageVisits: true });

    fireEvent.click(screen.getByRole("button", { name: /planStayOnDay/ }));

    expect(props.onAddVisit).toHaveBeenCalledWith(DATE_ISO);
  });

  it("shows the draft hint with an icon while a draft is open", () => {
    renderPanel({ isDraftMode: true, canManageVisits: true });

    const hint = screen.getByText("visits.calendar.selectedDayHintEditing");

    expect(hint.parentElement?.querySelector("svg[aria-hidden='true']")).not.toBeNull();
    expect(
      screen.getByRole("button", { name: /planStayOnDay/ }),
    ).toBeInTheDocument();
  });

  it("shows no hint under the add button when no draft is open", () => {
    renderPanel({ isDraftMode: false, canManageVisits: true });

    expect(
      screen.queryByText("visits.calendar.selectedDayHint"),
    ).not.toBeInTheDocument();
  });

  it("lists the day's visits as rows with their status", () => {
    renderPanel({
      day: createDay([createVisit(), createVisit({ id: 2, visitorName: "Tom" })]),
      canManageVisits: false,
    });

    const list = screen.getByRole("list");
    expect(within(list).getAllByRole("listitem")).toHaveLength(2);
    expect(
      within(list).getByRole("heading", { level: 4, name: "Eva Novak" }),
    ).toBeInTheDocument();
    expect(
      within(list).getByRole("heading", { level: 4, name: "Tom" }),
    ).toBeInTheDocument();
    expect(within(list).getAllByText("visits.status.upcoming")).toHaveLength(2);
  });

  it("offers delete only to admins", () => {
    const visit = createVisit();
    const props = renderPanel({ day: createDay([visit]) });

    fireEvent.click(
      screen.getByRole("button", {
        name: "visits.aria.deleteVisitFor:Eva Novak",
      }),
    );

    expect(props.onDelete).toHaveBeenCalledWith(visit);
  });

  it("hides delete from viewers", () => {
    renderPanel({ day: createDay([createVisit()]), canManageVisits: false });

    expect(
      screen.queryByRole("button", { name: /deleteVisitFor/ }),
    ).not.toBeInTheDocument();
  });
});
