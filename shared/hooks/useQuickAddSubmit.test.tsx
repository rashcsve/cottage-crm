import { describe, expect, it, vi } from "vitest";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm, type FieldErrors } from "react-hook-form";
import type { ActionResult } from "@/lib/types/actions.types";
import { useQuickAddSubmit } from "./useQuickAddSubmit";

type Values = {
  title: string;
  details: string;
};

const defaultValues: Values = {
  title: "",
  details: "",
};

const FIELDS = ["title", "details"] as const;

type Action = (data: Values) => Promise<ActionResult>;

function Harness({
  action,
  onFieldError,
  onInvalid,
}: {
  action: Action;
  onFieldError?: (field: "title" | "details") => void;
  onInvalid?: (errors: FieldErrors<Values>) => void;
}) {
  const form = useForm<Values, undefined, Values>({ defaultValues });
  const { handleFormSubmit, announcement } = useQuickAddSubmit({
    form,
    fields: FIELDS,
    defaultValues,
    action,
    getSuccessMessage: (data) => `Added: ${data.title}`,
    fallbackError: "Generic error",
    onFieldError,
    onInvalid,
  });
  const { errors } = form.formState;

  return (
    <form onSubmit={handleFormSubmit} noValidate>
      <p data-testid="announcement" data-id={announcement.id}>
        {announcement.text}
      </p>
      {errors.root?.message ? <p role="alert">{errors.root.message}</p> : null}
      <label>
        Title
        <input
          {...form.register("title", {
            validate: (value) => value !== "invalid" || "Client error",
          })}
        />
      </label>
      {errors.title?.message ? <p>{errors.title.message}</p> : null}
      <label>
        Details
        <input {...form.register("details")} />
      </label>
      {errors.details?.message ? <p>{errors.details.message}</p> : null}
      <button type="submit">Add</button>
    </form>
  );
}

function getTitle() {
  return screen.getByRole("textbox", { name: "Title" });
}

function getDetails() {
  return screen.getByRole("textbox", { name: "Details" });
}

function getAnnouncement() {
  return screen.getByTestId("announcement");
}

describe("useQuickAddSubmit", () => {
  it("starts with an empty announcement", () => {
    render(<Harness action={vi.fn<Action>()} />);

    expect(getAnnouncement()).toHaveTextContent("");
    expect(getAnnouncement()).toHaveAttribute("data-id", "0");
  });

  it("submits the values, announces, resets the fields and focuses the first field on success", async () => {
    const user = userEvent.setup();
    const action = vi.fn<Action>().mockResolvedValue({ ok: true });

    render(<Harness action={action} />);

    await user.type(getTitle(), "Milk");
    await user.type(getDetails(), "2 litres{Enter}");

    await waitFor(() => {
      expect(getAnnouncement()).toHaveTextContent("Added: Milk");
    });

    expect(action).toHaveBeenCalledWith({ title: "Milk", details: "2 litres" });
    expect(getTitle()).toHaveValue("");
    expect(getDetails()).toHaveValue("");
    expect(getTitle()).toHaveFocus();
  });

  it("changes the announcement id on every success, also for the same title", async () => {
    const user = userEvent.setup();
    const action = vi.fn<Action>().mockResolvedValue({ ok: true });

    render(<Harness action={action} />);

    await user.type(getTitle(), "Milk{Enter}");
    await waitFor(() => {
      expect(getAnnouncement()).toHaveAttribute("data-id", "1");
    });

    await user.type(getTitle(), "Milk{Enter}");
    await waitFor(() => {
      expect(getAnnouncement()).toHaveAttribute("data-id", "2");
    });

    expect(getAnnouncement()).toHaveTextContent("Added: Milk");
  });

  it("applies server field errors, keeps the text and focuses the first invalid field", async () => {
    const user = userEvent.setup();
    const onFieldError = vi.fn();
    const action = vi.fn<Action>().mockResolvedValue({
      ok: false,
      error: "Invalid",
      fieldErrors: { details: "Details error" },
    });

    render(<Harness action={action} onFieldError={onFieldError} />);

    await user.type(getTitle(), "Milk{Enter}");

    expect(await screen.findByText("Details error")).toBeInTheDocument();
    expect(onFieldError).toHaveBeenCalledWith("details");
    expect(getDetails()).toHaveFocus();
    expect(getTitle()).toHaveValue("Milk");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(getAnnouncement()).toHaveTextContent("");
  });

  it("calls onFieldError before moving focus to the invalid field", async () => {
    const user = userEvent.setup();
    let focusedDuringCallback: Element | null = null;
    const onFieldError = vi.fn(() => {
      focusedDuringCallback = document.activeElement;
    });
    const action = vi.fn<Action>().mockResolvedValue({
      ok: false,
      error: "Invalid",
      fieldErrors: { details: "Details error" },
    });

    render(<Harness action={action} onFieldError={onFieldError} />);

    await user.type(getTitle(), "Milk{Enter}");

    await waitFor(() => {
      expect(getDetails()).toHaveFocus();
    });
    expect(focusedDuringCallback).not.toBe(getDetails());
  });

  it("shows the server error as a root error and focuses the first field when there are no field errors", async () => {
    const user = userEvent.setup();
    const onFieldError = vi.fn();
    const action = vi.fn<Action>().mockResolvedValue({
      ok: false,
      error: "Server said no",
    });

    render(<Harness action={action} onFieldError={onFieldError} />);

    await user.type(getDetails(), "Note");
    await user.type(getTitle(), "Milk{Enter}");

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Server said no",
    );
    expect(onFieldError).not.toHaveBeenCalled();
    expect(getTitle()).toHaveFocus();
    expect(getTitle()).toHaveValue("Milk");
  });

  it("shows the fallback root error and focuses the first field when the action throws", async () => {
    const user = userEvent.setup();
    const action = vi.fn<Action>().mockRejectedValue(new Error("Network"));

    render(<Harness action={action} />);

    await user.type(getDetails(), "Note");
    await user.type(getTitle(), "Milk{Enter}");

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Generic error",
    );
    expect(getTitle()).toHaveFocus();
    expect(getTitle()).toHaveValue("Milk");
  });

  it("clears a previous root error when submitting again", async () => {
    const user = userEvent.setup();
    const action = vi
      .fn<Action>()
      .mockResolvedValueOnce({ ok: false, error: "Server said no" })
      .mockResolvedValueOnce({ ok: true });

    render(<Harness action={action} />);

    await user.type(getTitle(), "Milk{Enter}");
    expect(await screen.findByRole("alert")).toBeInTheDocument();

    await user.type(getTitle(), "{Enter}");

    await waitFor(() => {
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
  });

  it("blocks a second submit while the first is pending", async () => {
    const user = userEvent.setup();
    let resolveAction: (result: ActionResult) => void = () => {};
    const action = vi.fn<Action>().mockImplementation(
      () =>
        new Promise<ActionResult>((resolve) => {
          resolveAction = resolve;
        }),
    );

    render(<Harness action={action} />);

    await user.type(getTitle(), "Milk{Enter}");
    await waitFor(() => {
      expect(action).toHaveBeenCalledTimes(1);
    });

    await user.type(getTitle(), "{Enter}");
    await user.click(screen.getByRole("button", { name: "Add" }));

    expect(action).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveAction({ ok: true });
    });

    await waitFor(() => {
      expect(getAnnouncement()).toHaveTextContent("Added: Milk");
    });

    await user.type(getTitle(), "Bread{Enter}");

    await waitFor(() => {
      expect(action).toHaveBeenCalledTimes(2);
    });
  });

  it("passes client validation errors to onInvalid without calling the action", async () => {
    const user = userEvent.setup();
    const onInvalid = vi.fn();
    const action = vi.fn<Action>();

    render(<Harness action={action} onInvalid={onInvalid} />);

    await user.type(getTitle(), "invalid{Enter}");

    expect(await screen.findByText("Client error")).toBeInTheDocument();
    expect(onInvalid).toHaveBeenCalledWith(
      expect.objectContaining({ title: expect.anything() }),
      expect.anything(),
    );
    expect(action).not.toHaveBeenCalled();
  });
});
