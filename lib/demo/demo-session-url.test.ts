import { describe, it, expect, afterEach } from "vitest";

import { getDemoSessionUrl, getDemoCtaHref } from "./demo-session-url";

describe("getDemoSessionUrl", () => {
  it("builds a locale-scoped demo session URL", () => {
    expect(getDemoSessionUrl("en")).toBe("/api/demo/session?locale=en");
  });

  it("encodes the locale value", () => {
    expect(getDemoSessionUrl("cs/x")).toBe("/api/demo/session?locale=cs%2Fx");
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
