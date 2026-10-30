import { describe, it, expect, afterEach } from "vitest";

import { getDemoSessionUrl, getDemoCtaHref } from "./demo-session-url";

describe("getDemoSessionUrl", () => {
  it("builds a locale-scoped demo session URL", () => {
    expect(getDemoSessionUrl("en")).toBe("/api/demo/session?locale=en");
  });

  it("encodes the locale value", () => {
    expect(getDemoSessionUrl("cs/x")).toBe("/api/demo/session?locale=cs%2Fx");
  });

  it("adds an encoded next path when one is given", () => {
    expect(getDemoSessionUrl("en", "/en/visits?view=week&date=2026-11-02")).toBe(
      "/api/demo/session?locale=en&next=%2Fen%2Fvisits%3Fview%3Dweek%26date%3D2026-11-02",
    );
  });

  it("omits next when it is not given", () => {
    expect(getDemoSessionUrl("cs", undefined)).toBe("/api/demo/session?locale=cs");
  });
});

describe("getDemoCtaHref", () => {
  const ORIGINAL_NEXT_PUBLIC_DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE;

  afterEach(() => {
    process.env.NEXT_PUBLIC_DEMO_MODE = ORIGINAL_NEXT_PUBLIC_DEMO_MODE;
  });

  it("returns null when demo mode is off", () => {
    delete process.env.NEXT_PUBLIC_DEMO_MODE;

    expect(getDemoCtaHref("en")).toBeNull();
  });

  it("returns the demo session URL when demo mode is on", () => {
    process.env.NEXT_PUBLIC_DEMO_MODE = "1";

    expect(getDemoCtaHref("en")).toBe("/api/demo/session?locale=en");
  });
});
