"use client";

import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useLocale, useTranslations } from "next-intl";
import { VisitRow } from "./VisitRow";
import type { Visit } from "../../types/visits";

vi.mock("next-intl", () => ({
  useLocale: vi.fn(),
  useTranslations: vi.fn(),
}));

const mockUseLocale = vi.mocked(useLocale);
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
    note: null,
    author: "Admin",
    authorId: "user-1",
    createdAt: "2026-04-01T10:00:00.000Z",
    ...overrides,
  };
}

describe("VisitRow", () => {
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

  it("does not render delete actions in read-only mode", () => {
    render(<VisitRow visit={createVisit()} canManageVisits={false} />);

    expect(
      screen.queryByRole("button", {
        name: /visits\.aria\.deleteVisitFor/i,
      }),
    ).not.toBeInTheDocument();
  });

  it("includes the compact Czech date range for mobile visit rows", () => {
    mockUseLocale.mockReturnValue("cs");
    render(
      <VisitRow
        visit={createVisit({ dateFrom: "2026-10-25", dateTo: "2026-10-28" })}
        canManageVisits={false}
      />,
    );

    expect(screen.getByText("25. 10. – 28. 10. 2026")).toBeInTheDocument();
  });

  it("renders an interpolated delete aria label in manageable mode", () => {
    render(
      <VisitRow
        visit={createVisit()}
        canManageVisits={true}
        onDelete={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", {
        name: "visits.aria.deleteVisitFor:Eva Novak",
      }),
    ).toBeInTheDocument();
  });

  it("shows the couple name once when it matches the visitor name", () => {
    render(
      <VisitRow
        visit={createVisit({
          visitorName: "Martina a Petr",
          couple: "couple-3",
          coupleLabel: "Martina a Petr",
        })}
        canManageVisits={false}
      />,
    );

    expect(screen.getAllByText("Martina a Petr")).toHaveLength(1);
  });

  it("shows both the visitor name and the couple name when they differ", () => {
    render(
      <VisitRow
        visit={createVisit({
          visitorName: "Filip + kamarádi",
          coupleLabel: "Svetlana a Filip",
        })}
        canManageVisits={false}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Filip + kamarádi" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Svetlana a Filip")).toBeInTheDocument();
  });
});
