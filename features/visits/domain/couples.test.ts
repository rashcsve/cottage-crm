import { describe, expect, it } from "vitest";
import { getVisitCoupleLabel } from "./couples";

describe("getVisitCoupleLabel", () => {
  it("returns the couple label", () => {
    expect(
      getVisitCoupleLabel({ couple: "couple-1", coupleLabel: "Jana a Tomáš" }, "No couple")
    ).toBe("Jana a Tomáš");
  });

  it("returns the no-couple text for a visit without a couple", () => {
    expect(
      getVisitCoupleLabel({ couple: null, coupleLabel: null }, "No couple")
    ).toBe("No couple");
  });

  it("returns null when a couple has no label", () => {
    expect(
      getVisitCoupleLabel({ couple: "couple-1", coupleLabel: null }, "No couple")
    ).toBeNull();
  });
});
