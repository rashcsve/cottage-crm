import { describe, it, expect, afterEach } from "vitest";

import { isDemoModeEnabled, isClientDemoModeEnabled } from "./is-demo-mode";

const ORIGINAL_NEXT_PUBLIC_DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE;

describe("isDemoModeEnabled / isClientDemoModeEnabled", () => {
  afterEach(() => {
    process.env.NEXT_PUBLIC_DEMO_MODE = ORIGINAL_NEXT_PUBLIC_DEMO_MODE;
  });

  it("both return false when NEXT_PUBLIC_DEMO_MODE is unset", () => {
    delete process.env.NEXT_PUBLIC_DEMO_MODE;

    expect(isDemoModeEnabled()).toBe(false);
    expect(isClientDemoModeEnabled()).toBe(false);
  });

  it("both return false for any value other than '1'", () => {
    process.env.NEXT_PUBLIC_DEMO_MODE = "true";

    expect(isDemoModeEnabled()).toBe(false);
    expect(isClientDemoModeEnabled()).toBe(false);
  });

  it("both return true when NEXT_PUBLIC_DEMO_MODE is '1'", () => {
    process.env.NEXT_PUBLIC_DEMO_MODE = "1";

    expect(isDemoModeEnabled()).toBe(true);
    expect(isClientDemoModeEnabled()).toBe(true);
  });
});
