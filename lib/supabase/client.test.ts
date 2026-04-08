import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("@supabase/ssr", () => ({
  createBrowserClient: vi.fn(() => ({
    auth: {},
    from: vi.fn(),
  })),
}));

describe("getBrowserSupabaseClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("returns the same client instance on multiple calls (memoization)", async () => {
    const { getBrowserSupabaseClient: getClient } = await import("./client");

    const client1 = getClient();
    const client2 = getClient();
    const client3 = getClient();

    expect(client1).toBe(client2);
    expect(client2).toBe(client3);
  });

  it("creates client only once", async () => {
    const { createBrowserClient } = await import("@supabase/ssr");
    const { getBrowserSupabaseClient: getClient } = await import("./client");

    const createMock = vi.mocked(createBrowserClient);

    getClient();
    getClient();
    getClient();

    expect(createMock).toHaveBeenCalledTimes(1);
  });

  it("creates a new instance after module reset", async () => {
    const firstModule = await import("./client");
    const firstClient = firstModule.getBrowserSupabaseClient();

    vi.resetModules();

    const secondModule = await import("./client");
    const secondClient = secondModule.getBrowserSupabaseClient();

    expect(firstClient).not.toBe(secondClient);
  });
});
