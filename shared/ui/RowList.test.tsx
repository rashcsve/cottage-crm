import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";

import { RowList, RowListActions, RowListItem } from "./RowList";

describe("RowList", () => {
  it("renders a list of row items", () => {
    render(
      <RowList aria-label="Latest notes">
        <RowListItem>First note</RowListItem>
        <RowListItem>Second note</RowListItem>
      </RowList>,
    );

    const list = screen.getByRole("list", { name: "Latest notes" });
    const items = within(list).getAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent("First note");
    expect(items[1]).toHaveTextContent("Second note");
  });

  it("forwards id and aria attributes to the row item", () => {
    render(
      <RowList>
        <RowListItem id="task-1" aria-current="true">
          Buy firewood
        </RowListItem>
      </RowList>,
    );

    const item = screen.getByRole("listitem");
    expect(item).toHaveAttribute("id", "task-1");
    expect(item).toHaveAttribute("aria-current", "true");
  });
});

describe("RowListActions", () => {
  it("hides actions until hover only on hover devices and reveals them on focus", () => {
    render(
      <RowListActions className="col-start-2">
        <button type="button">Delete</button>
      </RowListActions>,
    );

    const actions = screen.getByRole("button", { name: "Delete" }).parentElement;
    expect(actions).toHaveClass(
      "[@media(hover:hover)]:opacity-0",
      "[@media(hover:hover)]:group-hover:opacity-100",
      "group-focus-within:opacity-100",
      "col-start-2",
    );
    expect(actions).not.toHaveClass("opacity-0");
  });
});
