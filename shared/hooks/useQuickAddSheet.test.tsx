import { describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useQuickAddSheet } from "./useQuickAddSheet";

function renderSheet() {
  return renderHook(() => useQuickAddSheet((title) => `Added: ${title}`));
}

describe("useQuickAddSheet", () => {
  it("starts closed with an empty announcement", () => {
    const { result } = renderSheet();

    expect(result.current.isOpen).toBe(false);
    expect(result.current.announcement).toEqual({ id: 0, text: "" });
  });

  it("opens and closes without announcing", () => {
    const { result } = renderSheet();

    act(() => result.current.open());
    expect(result.current.isOpen).toBe(true);

    act(() => result.current.close());
    expect(result.current.isOpen).toBe(false);
    expect(result.current.announcement.text).toBe("");
  });

  it("closes the sheet and announces the added title", () => {
    const { result } = renderSheet();

    act(() => result.current.open());
    act(() => result.current.handleAdded("Milk"));

    expect(result.current.isOpen).toBe(false);
    expect(result.current.announcement).toEqual({ id: 1, text: "Added: Milk" });
  });

  it("gives a repeated title a new announcement id so it is read again", () => {
    const { result } = renderSheet();

    act(() => result.current.handleAdded("Milk"));
    act(() => result.current.handleAdded("Milk"));

    expect(result.current.announcement).toEqual({ id: 2, text: "Added: Milk" });
  });
});
