import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useTranslations } from "next-intl";
import type { CalendarSegment } from "../../../domain/visits-calendar-types";
import type { Visit, VisitStatus } from "../../../types/visits";
import { VisitsWeekTimeline } from "./VisitsWeekTimeline";

vi.mock("next-intl", () => ({
  useTranslations: vi.fn(),
}));

const mockUseTranslations = vi.mocked(useTranslations);

function createVisit(overrides: Partial<Visit> = {}): Visit {
  return {
    id: 1,
    visitorName: "Eva Novak",
    couple: "couple-1",
    coupleLabel: null,
    dateFrom: "2026-04-10",
    dateTo: "2026-04-12",
    status: "upcoming",
    note: "Bring spare keys for the back entrance.",
    author: "Admin",
    authorId: "user-1",
    createdAt: "2026-04-01T10:00:00.000Z",
    ...overrides,
  };
}

function createSegment(
  visit: Visit,
  overrides: Partial<CalendarSegment> = {}
): CalendarSegment {
  return {
    key: `visit-${visit.id}`,
    visit,
    startIndex: 0,
    span: 1,
    continuesBefore: false,
    continuesAfter: false,
    ...overrides,
  };
}

describe("VisitsWeekTimeline", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseTranslations.mockImplementation((namespace?: string) => {
      const prefix = namespace ? `${namespace}.` : "";

      return ((key: string) => `${prefix}${key}`) as ReturnType<
        typeof useTranslations
      >;
    });
  });

  it("renders nothing when the week has no visits", () => {
    const { container } = render(<VisitsWeekTimeline rows={[]} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("renders a multi-day visit as one bar with the visitor name once", () => {
    const visit = createVisit({ couple: null });

    render(
      <VisitsWeekTimeline
        rows={[[createSegment(visit, { startIndex: 2, span: 3 })]]}
      />
    );

    expect(
      screen.getAllByTitle("Eva Novak · visits.meta.noCouple")
    ).toHaveLength(1);
    expect(screen.getAllByText("Eva Novak")).toHaveLength(1);
  });

  it("does not encode visit status by colour in the timeline bars", () => {
    const statuses: VisitStatus[] = ["current", "upcoming", "past"];

    const barClassNames = statuses.map((status, index) => {
      const visitorName = `Visitor ${status}`;
      const visit = createVisit({ id: index + 1, status, visitorName });
      const { unmount } = render(
        <VisitsWeekTimeline rows={[[createSegment(visit)]]} />
      );

      const className = screen.getByTitle(visitorName).className;

      unmount();

      return className;
    });

    expect(new Set(barClassNames).size).toBe(1);
  });

  it("names a visit without a couple in the timeline bar tooltip", () => {
    render(
      <VisitsWeekTimeline
        rows={[[createSegment(createVisit({ couple: null }))]]}
      />
    );

    expect(
      screen.getByTitle("Eva Novak · visits.meta.noCouple")
    ).toBeInTheDocument();
  });

  it("marks a visit that continues across both week edges in the tooltip", () => {
    render(
      <VisitsWeekTimeline
        rows={[
          [
            createSegment(createVisit({ couple: null }), {
              span: 7,
              continuesBefore: true,
              continuesAfter: true,
            }),
          ],
        ]}
      />
    );

    expect(
      screen.getByTitle("... Eva Novak ... · visits.meta.noCouple")
    ).toBeInTheDocument();
  });

  it("renders overlapping visits on separate lanes", () => {
    render(
      <VisitsWeekTimeline
        rows={[
          [createSegment(createVisit({ id: 1 }), { span: 4 })],
          [
            createSegment(createVisit({ id: 2, visitorName: "Tom Dvorak" }), {
              startIndex: 2,
              span: 3,
            }),
          ],
        ]}
      />
    );

    expect(screen.getByText("Eva Novak")).toBeInTheDocument();
    expect(screen.getByText("Tom Dvorak")).toBeInTheDocument();
  });

  it.each([
    { startIndex: 7, span: 1 },
    { startIndex: 0, span: 0 },
    { startIndex: 0, span: 8 },
  ])(
    "refuses to place a bar outside the week (start $startIndex, span $span)",
    ({ startIndex, span }) => {
      const consoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      expect(() =>
        render(
          <VisitsWeekTimeline
            rows={[[createSegment(createVisit(), { startIndex, span })]]}
          />
        )
      ).toThrow(/out of range/);

      consoleError.mockRestore();
    }
  );
});
