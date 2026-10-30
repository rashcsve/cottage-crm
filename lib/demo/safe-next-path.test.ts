import { describe, it, expect } from "vitest";

import { getSafeDashboardNextPath } from "./safe-next-path";

describe("getSafeDashboardNextPath", () => {
  it.each([
    "/visits",
    "/en/visits",
    "/visits?view=week&date=2026-11-02",
    "/en/tasks?status=open",
    "/overview/",
    "/cs/visits",
    "/visits?next=https://x",
    "/tasks?q=50%25",
  ])("accepts the dashboard path %s", (next) => {
    expect(getSafeDashboardNextPath(next)).toBe(next);
  });

  it.each([
    ["null", null],
    ["an empty string", ""],
    ["an absolute URL", "https://evil.com"],
    ["a protocol-relative URL", "//evil.com"],
    ["a backslash host", "/\\evil.com"],
    ["an encoded protocol-relative URL", "/%2F%2Fevil.com"],
    ["an encoded backslash", "/%5Cevil.com"],
    ["the demo route itself", "/api/demo/session"],
    ["the login page", "/login"],
    ["the home page", "/"],
    ["a path that only starts with a dashboard route", "/overviewx"],
    ["an unsupported locale prefix", "/de/visits"],
    ["a locale without a dashboard path", "/en"],
    ["a relative path", "visits"],
    ["a dot-dot segment", "/visits/../login"],
    ["a dot segment", "/visits/./x"],
    ["an empty segment", "/visits//evil.com"],
    ["a repeated locale prefix", "/en/en/visits"],
    ["a newline", "/visits\n"],
    ["a tab inside the host part", "/\t/evil.com"],
    ["an encoded carriage return", "/visits%0d"],
    ["a dashboard path with a fragment-smuggled host", "/visits#//evil.com"],
  ])("rejects %s", (_label, next) => {
    expect(getSafeDashboardNextPath(next)).toBeNull();
  });
});
