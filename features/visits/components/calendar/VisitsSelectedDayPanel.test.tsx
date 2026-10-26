import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useLocale, useTranslations } from "next-intl";
import { VisitsSelectedDayPanel } from "./VisitsSelectedDayPanel";
import { formatVisitFullDate } from "../../shared/formatVisitDate";
import type { Visit } from "../../types/visits";

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

describe("VisitsSelectedDayPanel", () => {
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
    render(
      <VisitsSelectedDayPanel
        dateIso={null}
        visits={[]}
        isDraftMode={false}
        canManageVisits={true}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "visits.calendar.chooseDayTitle" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("titles the panel with the date and lists the day's visits with their status", () => {
    const dateLabel = formatVisitFullDate(DATE_ISO, "en");

    render(
      <VisitsSelectedDayPanel
        dateIso={DATE_ISO}
        visits={[createVisit(), createVisit({ id: 2, visitorName: "Tom" })]}
        isDraftMode={false}
        canManageVisits={false}
      />,
    );

    const region = screen.getByRole("region", { name: dateLabel });
    expect(
      within(region).getByRole("heading", { name: dateLabel }),
    ).toBeInTheDocument();
    expect(within(region).getByText("visits.calendar.selectedDay")).toBeInTheDocument();

    const list = within(region).getByRole("list", { name: dateLabel });
    expect(within(list).getAllByRole("listitem")).toHaveLength(2);
    expect(within(list).getByText("Eva Novak")).toBeInTheDocument();
    expect(within(list).getByText("Tom")).toBeInTheDocument();
    expect(within(list).getAllByText("visits.status.upcoming")).toHaveLength(2);
  });

  it("offers adding a visit on the selected day to admins", () => {
    const onAddVisit = vi.fn();
    const dateLabel = formatVisitFullDate(DATE_ISO, "en");

    render(
      <VisitsSelectedDayPanel
        dateIso={DATE_ISO}
        visits={[]}
        isDraftMode={false}
        canManageVisits={true}
        onAddVisit={onAddVisit}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: `visits.calendar.addVisitOnDay:${dateLabel}`,
      }),
    );

    expect(onAddVisit).toHaveBeenCalledTimes(1);
    expect(
      screen.getByRole("heading", { name: "visits.calendar.noVisitsTitle" }),
    ).toBeInTheDocument();
  });

  it("hides the add button while a draft is open and for viewers", () => {
    const { rerender } = render(
      <VisitsSelectedDayPanel
        dateIso={DATE_ISO}
        visits={[]}
        isDraftMode={true}
        canManageVisits={true}
        onAddVisit={vi.fn()}
      />,
    );

    expect(screen.queryByRole("button")).not.toBeInTheDocument();

    rerender(
      <VisitsSelectedDayPanel
        dateIso={DATE_ISO}
        visits={[]}
        isDraftMode={false}
        canManageVisits={false}
        onAddVisit={vi.fn()}
      />,
    );

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("lets admins delete a visit from the panel", () => {
    const onDelete = vi.fn();
    const visit = createVisit();

    render(
      <VisitsSelectedDayPanel
        dateIso={DATE_ISO}
        visits={[visit]}
        isDraftMode={false}
        canManageVisits={true}
        onDelete={onDelete}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "visits.aria.deleteVisitFor:Eva Novak",
      }),
    );

    expect(onDelete).toHaveBeenCalledWith(visit);
  });
});
