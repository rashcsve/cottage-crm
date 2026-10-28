import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";
import {
  buildVisitsCalendarSearchParams,
  mergeVisitsCalendarSearchParams,
  parseVisitsCalendarSearchParams,
  parseVisitsCalendarUrlState,
  readVisitsCalendarLocationState,
  readVisitsCalendarUrlState,
} from "./visits-calendar-url-state";

const repoRoot = path.resolve(import.meta.dirname, "../../../..");

const IMPORT_SPECIFIER_PATTERN =
  /(?:\bfrom\s*|\bimport\s*|\bimport\s*\(\s*|\brequire\s*\(\s*)["']([^"']+)["']/g;

function readImportSpecifiers(source: string): string[] {
  return Array.from(source.matchAll(IMPORT_SPECIFIER_PATTERN), (match) =>
    match[1],
  ).filter((specifier): specifier is string => specifier !== undefined);
}

function isZodSpecifier(specifier: string): boolean {
  return specifier === "zod" || specifier.startsWith("zod/");
}

function resolveLocalModule(
  specifier: string,
  fromFile: string,
): string | undefined {
  const base = specifier.startsWith("@/")
    ? path.join(repoRoot, specifier.slice(2))
    : specifier.startsWith(".")
      ? path.resolve(path.dirname(fromFile), specifier)
      : undefined;

  if (base === undefined) {
    return undefined;
  }

  return [
    base,
    `${base}.ts`,
    `${base}.tsx`,
    path.join(base, "index.ts"),
    path.join(base, "index.tsx"),
  ].find((candidate) => existsSync(candidate) && candidate.match(/\.tsx?$/));
}

function findZodImporters(entry: string): string[] {
  const visited = new Set<string>();
  const importers: string[] = [];
  const pending = [entry];

  while (pending.length > 0) {
    const file = pending.pop();

    if (file === undefined || visited.has(file)) {
      continue;
    }

    visited.add(file);

    for (const specifier of readImportSpecifiers(readFileSync(file, "utf8"))) {
      if (isZodSpecifier(specifier)) {
        importers.push(path.relative(repoRoot, file));
        continue;
      }

      const resolved = resolveLocalModule(specifier, file);

      if (resolved !== undefined) {
        pending.push(resolved);
      }
    }
  }

  return importers;
}

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

  it.each(["month", "week", "agenda"])(
    "accepts the %s view",
    (view) => {
      expect(parseVisitsCalendarSearchParams({ view })).toEqual({
        view,
        date: undefined,
      });
    },
  );

  it.each([
    "Month",
    "WEEK",
    " month",
    "month ",
    "",
    "toString",
    "constructor",
    "__proto__",
    "hasOwnProperty",
    "0",
    "length",
  ])("rejects the view value %j", (view) => {
    expect(parseVisitsCalendarSearchParams({ view })).toEqual({
      view: undefined,
      date: undefined,
    });
    expect(
      parseVisitsCalendarSearchParams(new URLSearchParams({ view })),
    ).toEqual({
      view: undefined,
      date: undefined,
    });
  });

  it("returns no view when the param is missing", () => {
    expect(parseVisitsCalendarSearchParams({})).toEqual({
      view: undefined,
      date: undefined,
    });
    expect(parseVisitsCalendarSearchParams(new URLSearchParams())).toEqual({
      view: undefined,
      date: undefined,
    });
  });

  it("uses only the first array value even when a later one is valid", () => {
    expect(
      parseVisitsCalendarSearchParams({ view: ["quarter", "week"] }),
    ).toEqual({
      view: undefined,
      date: undefined,
    });
    expect(parseVisitsCalendarSearchParams({ view: [] })).toEqual({
      view: undefined,
      date: undefined,
    });
  });

  it("uses the first repeated url param", () => {
    expect(
      parseVisitsCalendarSearchParams(
        new URLSearchParams("view=agenda&view=week"),
      ),
    ).toEqual({
      view: "agenda",
      date: undefined,
    });
  });

  it("keeps the view when only the date is invalid, and the date when only the view is invalid", () => {
    expect(
      readVisitsCalendarUrlState(
        new URLSearchParams({ view: "week", date: "2026-02-30" }),
        "2026-04-10",
      ),
    ).toEqual({ view: "week", anchorIso: "2026-04-10" });
    expect(
      readVisitsCalendarUrlState(
        new URLSearchParams({ view: "Week", date: "2026-02-28" }),
        "2026-04-10",
      ),
    ).toEqual({ view: "month", anchorIso: "2026-02-28" });
  });

  it("canonicalizes a view that differs only by case", () => {
    const result = readVisitsCalendarLocationState(
      new URLSearchParams({ view: "Agenda", date: "2026-04-17" }),
      "2026-04-10",
    );

    expect(result.urlState).toEqual({
      view: "month",
      anchorIso: "2026-04-17",
    });
    expect(result.shouldCanonicalize).toBe(true);
    expect(result.canonicalSearchParams.toString()).toBe(
      "view=month&date=2026-04-17",
    );
  });

  it("does not canonicalize params that are already canonical", () => {
    const result = readVisitsCalendarLocationState(
      new URLSearchParams({ foo: "bar", view: "week", date: "2026-04-17" }),
      "2026-04-10",
    );

    expect(result.shouldCanonicalize).toBe(false);
  });

  it("does not import zod, even transitively, so the calendar keeps it out of the /visits client bundle", () => {
    const entry = path.join(
      import.meta.dirname,
      "visits-calendar-url-state.ts",
    );

    expect(findZodImporters(entry)).toEqual([]);
  });

  it("detects every way of importing zod in the transitive guard", () => {
    expect(
      [
        'import { z } from "zod";',
        "import 'zod';",
        'import "zod/v4";',
        'export { z } from "zod";',
        'const { z } = require("zod");',
        'const zod = await import("zod");',
      ].map((source) => readImportSpecifiers(source).some(isZodSpecifier)),
    ).toEqual([true, true, true, true, true, true]);
    expect(
      readImportSpecifiers('import { zodLike } from "./zod-like";').some(
        isZodSpecifier,
      ),
    ).toBe(false);
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
