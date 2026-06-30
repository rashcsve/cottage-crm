import { describe, expect, it } from "vitest";
import {
  createVisitSchema,
  DeleteVisitSchema,
  type CreateVisitSchemaMessages,
} from "./index";

function createMessages(
  overrides: Partial<CreateVisitSchemaMessages> = {},
): CreateVisitSchemaMessages {
  return {
    visitorNameRequired: "Name is required",
    visitorNameTooLong: "Name is too long",
    dateFromInvalid: "Start date is invalid",
    dateToInvalid: "End date is invalid",
    dateRangeInvalid: "End date must be on or after start date",
    noteTooLong: "Note is too long",
    ...overrides,
  };
}

function createSchema() {
  return createVisitSchema(createMessages());
}

describe("createVisitSchema", () => {
  it("accepts a valid input", () => {
    const result = createSchema().safeParse({
      visitorName: "Svetlana and Filip",
      dateFrom: "2026-04-10",
      dateTo: "2026-04-12",
      note: "Bring spare keys.",
    });

    expect(result.success).toBe(true);
  });

  it("accepts a same-day stay (dateFrom === dateTo)", () => {
    const result = createSchema().safeParse({
      visitorName: "One-night guest",
      dateFrom: "2026-06-15",
      dateTo: "2026-06-15",
      note: null,
    });

    expect(result.success).toBe(true);
  });

  it("accepts a null note", () => {
    const result = createSchema().safeParse({
      visitorName: "Guest",
      dateFrom: "2026-04-10",
      dateTo: "2026-04-12",
      note: null,
    });

    expect(result.success).toBe(true);
  });

  it("accepts an omitted note", () => {
    const result = createSchema().safeParse({
      visitorName: "Guest",
      dateFrom: "2026-04-10",
      dateTo: "2026-04-12",
    });

    expect(result.success).toBe(true);
  });

  it("trims whitespace from visitorName", () => {
    const result = createSchema().safeParse({
      visitorName: "  Trimmed Name  ",
      dateFrom: "2026-04-10",
      dateTo: "2026-04-12",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.visitorName).toBe("Trimmed Name");
    }
  });

  it("rejects an empty visitorName", () => {
    const messages = createMessages({ visitorNameRequired: "Name is required" });
    const result = createVisitSchema(messages).safeParse({
      visitorName: "",
      dateFrom: "2026-04-10",
      dateTo: "2026-04-12",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Name is required");
      expect(result.error.issues[0]?.path).toEqual(["visitorName"]);
    }
  });

  it("rejects a visitorName exceeding 255 characters", () => {
    const messages = createMessages({ visitorNameTooLong: "Name is too long" });
    const result = createVisitSchema(messages).safeParse({
      visitorName: "A".repeat(256),
      dateFrom: "2026-04-10",
      dateTo: "2026-04-12",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Name is too long");
    }
  });

  it("rejects an invalid dateFrom", () => {
    const messages = createMessages({ dateFromInvalid: "Start date is invalid" });
    const result = createVisitSchema(messages).safeParse({
      visitorName: "Guest",
      dateFrom: "not-a-date",
      dateTo: "2026-04-12",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Start date is invalid");
      expect(result.error.issues[0]?.path).toEqual(["dateFrom"]);
    }
  });

  it("rejects an invalid dateTo", () => {
    const messages = createMessages({ dateToInvalid: "End date is invalid" });
    const result = createVisitSchema(messages).safeParse({
      visitorName: "Guest",
      dateFrom: "2026-04-10",
      dateTo: "not-a-date",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("End date is invalid");
      expect(result.error.issues[0]?.path).toEqual(["dateTo"]);
    }
  });

  it("rejects dateFrom after dateTo and places the error on dateTo", () => {
    const messages = createMessages({
      dateRangeInvalid: "End date must be on or after start date",
    });
    const result = createVisitSchema(messages).safeParse({
      visitorName: "Guest",
      dateFrom: "2026-04-15",
      dateTo: "2026-04-10",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const rangeIssue = result.error.issues.find(
        (issue) => issue.path[0] === "dateTo",
      );

      expect(rangeIssue?.message).toBe(
        "End date must be on or after start date",
      );
    }
  });

  it("rejects a note exceeding 1000 characters", () => {
    const messages = createMessages({ noteTooLong: "Note is too long" });
    const result = createVisitSchema(messages).safeParse({
      visitorName: "Guest",
      dateFrom: "2026-04-10",
      dateTo: "2026-04-12",
      note: "N".repeat(1001),
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Note is too long");
      expect(result.error.issues[0]?.path).toEqual(["note"]);
    }
  });
});

describe("DeleteVisitSchema", () => {
  it("accepts a positive integer visitId", () => {
    expect(DeleteVisitSchema.safeParse({ visitId: 1 }).success).toBe(true);
  });

  it("rejects a zero visitId", () => {
    expect(DeleteVisitSchema.safeParse({ visitId: 0 }).success).toBe(false);
  });

  it("rejects a negative visitId", () => {
    expect(DeleteVisitSchema.safeParse({ visitId: -5 }).success).toBe(false);
  });

  it("rejects a non-integer visitId", () => {
    expect(DeleteVisitSchema.safeParse({ visitId: 1.5 }).success).toBe(false);
  });
});
