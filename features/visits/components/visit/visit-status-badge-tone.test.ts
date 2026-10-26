import { CalendarClock, History, LogIn } from "lucide-react";
import { describe, expect, it } from "vitest";
import { getVisitStatusTone } from "./visit-status-badge-tone";

describe("getVisitStatusTone", () => {
  it("maps a current visit to success with the log-in icon", () => {
    expect(getVisitStatusTone("current")).toEqual({
      tone: "success",
      icon: LogIn,
    });
  });

  it("maps an upcoming visit to neutral with the calendar-clock icon", () => {
    expect(getVisitStatusTone("upcoming")).toEqual({
      tone: "neutral",
      icon: CalendarClock,
    });
  });

  it("maps a past visit to neutral with the history icon", () => {
    expect(getVisitStatusTone("past")).toEqual({
      tone: "neutral",
      icon: History,
    });
  });
});
