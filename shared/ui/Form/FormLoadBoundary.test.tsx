import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Component, lazy } from "react";
import type { ReactNode } from "react";

import { FormLoadBoundary } from "./FormLoadBoundary";

function BrokenForm(): never {
  const error = new Error("Loading chunk 42 failed.");
  error.name = "ChunkLoadError";
  throw error;
}

function FormWithBug(): never {
  throw new TypeError("form bug");
}

const PendingForm = lazy(() => new Promise<never>(() => {}));

class OuterBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    return this.state.error ? (
      <p>outer: {this.state.error.message}</p>
    ) : (
      this.props.children
    );
  }
}

const labels = {
  message: "The form could not be loaded.",
  reloadLabel: "Reload page",
  loadingLabel: "Loading",
};

describe("FormLoadBoundary", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders its children when they load", () => {
    render(
      <FormLoadBoundary {...labels}>
        <p>form</p>
      </FormLoadBoundary>,
    );

    expect(screen.getByText("form")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("announces a loading status while the form chunk is pending", () => {
    render(
      <FormLoadBoundary {...labels}>
        <PendingForm />
      </FormLoadBoundary>,
    );

    expect(screen.getByRole("status")).toHaveTextContent("Loading");
  });

  it("shows an error and focuses a keyboard-operable reload action when loading fails", async () => {
    const user = userEvent.setup();
    const onReload = vi.fn();

    render(
      <FormLoadBoundary {...labels} onReload={onReload}>
        <BrokenForm />
      </FormLoadBoundary>,
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "The form could not be loaded.",
    );
    expect(screen.getByRole("button", { name: "Reload page" })).toHaveFocus();

    await user.keyboard("{Enter}");

    expect(onReload).toHaveBeenCalledTimes(1);
  });

  it("lets render errors that are not chunk failures reach the outer boundary", () => {
    render(
      <OuterBoundary>
        <FormLoadBoundary {...labels}>
          <FormWithBug />
        </FormLoadBoundary>
      </OuterBoundary>,
    );

    expect(screen.getByText("outer: form bug")).toBeInTheDocument();
    expect(
      screen.queryByText("The form could not be loaded."),
    ).not.toBeInTheDocument();
  });
});
