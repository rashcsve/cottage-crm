import { describe, expect, it } from "vitest";
import {
  buildVisitsCalendarSearchParams,
  mergeVisitsCalendarSearchParams,
  parseVisitsCalendarSearchParams,
  parseVisitsCalendarUrlState,
  readVisitsCalendarLocationState,
  readVisitsCalendarUrlState,
} from "./visits-calendar-url-state";

describe("features/visits/application/calendar/visits-calendar-url-state", () => {
  it("parses validated search params into durable calendar url state", () => {
    const state = parseVisitsCalendarUrlState(
      parseVisitsCalendarSearchParams(
        new URLSearchParams({
          view: "week",
          date: "2026-04-12",
          selected: "2026-04-13",
          compose: "1",
          from: "2026-04-13",
          to: "2026-04-15",
        }),
      ),
      "2026-04-10",
    );

    expect(state).toEqual({
      view: "week",
      anchorIso: "2026-04-12",
    });
  });

  it("falls back to today for invalid search params", () => {
    const state = parseVisitsCalendarUrlState(
      parseVisitsCalendarSearchParams(
        new URLSearchParams({
          view: "oops",
          date: "2026-99-99",
        }),
      ),
      "2026-04-10",
    );

    expect(state).toEqual({
      view: "month",
      anchorIso: "2026-04-10",
    });
  });

  it("reads durable visits url state directly from raw search params", () => {
    const state = readVisitsCalendarUrlState(
      new URLSearchParams({
        view: "agenda",
        date: "2026-04-17",
        selected: "2026-04-17",
        compose: "1",
        from: "2026-04-17",
        to: "2026-04-19",
      }),
      "2026-04-10",
    );

    expect(state).toEqual({
      view: "agenda",
      anchorIso: "2026-04-17",
    });
  });

  it("builds query params from visits calendar state only", () => {
    const next = buildVisitsCalendarSearchParams({
      view: "week",
      anchorIso: "2026-04-17",
    });

    expect(next.toString()).toBe("view=week&date=2026-04-17");
  });

  it("merges canonical visits params while preserving unrelated query params", () => {
    const next = mergeVisitsCalendarSearchParams(
      new URLSearchParams({
        foo: "bar",
        view: "quarter",
        date: "2026-99-99",
        selected: "2026-04-17",
      }),
      {
        view: "week",
        anchorIso: "2026-04-17",
      },
    );

    expect(next.toString()).toBe("foo=bar&view=week&date=2026-04-17");
  });

  it("normalizes raw page search params into a strict visits search-param object", () => {
    expect(
      parseVisitsCalendarSearchParams({
        view: ["agenda", "week"],
        date: "2026-04-10",
      }),
    ).toEqual({
      view: "agenda",
      date: "2026-04-10",
    });
  });

  it("ignores invalid view values instead of smuggling them into the url state parser", () => {
    expect(
      parseVisitsCalendarSearchParams({
        view: "quarter",
        date: "2026-04-10",
      }),
    ).toEqual({
      view: undefined,
      date: "2026-04-10",
    });
  });

  it("marks invalid visits params as needing canonicalization", () => {
    const result = readVisitsCalendarLocationState(
      new URLSearchParams({
        foo: "bar",
        view: "montsdasdas",
        date: "2026-99-99",
      }),
      "2026-04-10",
    );

    expect(result.urlState).toEqual({
      view: "month",
      anchorIso: "2026-04-10",
    });
    expect(result.shouldCanonicalize).toBe(true);
    expect(result.canonicalSearchParams.toString()).toBe(
      "foo=bar&view=month&date=2026-04-10",
    );
  });

  it("does not canonicalize when visits params are absent", () => {
    const result = readVisitsCalendarLocationState(
      new URLSearchParams({
        foo: "bar",
      }),
      "2026-04-10",
    );

    expect(result.shouldCanonicalize).toBe(false);
    expect(result.canonicalSearchParams.toString()).toBe(
      "foo=bar&view=month&date=2026-04-10",
    );
  });
});
