import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";

import { createVisit } from "./mutations";

const TODAY = "2026-05-10";

const input = {
  visitorName: "Jana a Tomáš",
  couple: "couple-1" as const,
  dateFrom: "2026-05-15",
  dateTo: "2026-05-17",
  note: null,
};

const insertedRow = {
  id: 7,
  visitor_name: "Jana a Tomáš",
  couple: "couple-1",
  date_from: "2026-05-15",
  date_to: "2026-05-17",
  note: null,
  author_id: "user-1",
  created_at: "2026-05-10T10:00:00.000Z",
  author: { display_name: "Světlana" },
  couple_details: { label: "Jana a Tomáš" },
};

interface MockOptions {
  insertError?: { code: string; message: string } | null;
}

function createClientMock({ insertError = null }: MockOptions = {}) {
  const insert = vi.fn();

  const insertQuery = {
    select: () => insertQuery,
    single: async () =>
      insertError
        ? { data: null, error: insertError }
        : { data: insertedRow, error: null },
  };

  const client = {
    from: () => ({
      insert: (values: unknown) => {
        insert(values);
        return insertQuery;
      },
    }),
  };

  return { client: client as unknown as SupabaseClient, insert };
}

describe("createVisit", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("inserts the visit with its couple", async () => {
    const { client, insert } = createClientMock();

    const result = await createVisit(client, "user-1", input, TODAY);

    expect(result.ok).toBe(true);
    expect(result.ok && result.data.couple).toBe("couple-1");
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({ couple: "couple-1", author_id: "user-1" }),
    );
  });

  it("returns conflict when the database rejects an overlap", async () => {
    const { client } = createClientMock({
      insertError: { code: "23P01", message: "exclusion violation" },
    });

    const result = await createVisit(client, "user-1", input, TODAY);

    expect(result).toEqual({ ok: false, error: "conflict" });
  });

  it("returns databaseError for other database errors", async () => {
    const { client } = createClientMock({
      insertError: { code: "42501", message: "denied" },
    });

    const result = await createVisit(client, "user-1", input, TODAY);

    expect(result).toEqual({ ok: false, error: "databaseError" });
  });
});
