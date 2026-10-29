import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { expect, fn, userEvent, within } from "storybook/test";

import { AddItemPanel, AddItemPanelFooter } from "./AddItemPanel";
import { Button } from "./Button";
import { TextAreaField } from "./Form/Field";

const VIEWPORTS = {
  mobile: {
    name: "Mobile (390px)",
    styles: { width: "390px", height: "844px" },
    type: "mobile",
  },
  desktop: {
    name: "Desktop (1280px)",
    styles: { width: "1280px", height: "800px" },
    type: "desktop",
  },
};

function PanelDemo({
  modal,
  onClose,
  withPageControl = false,
  withFooter = false,
}: {
  modal?: boolean;
  onClose: () => void;
  withPageControl?: boolean;
  withFooter?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [dayClicks, setDayClicks] = useState(0);

  return (
    <>
      <Button type="button" onClick={() => setOpen(true)}>
        Add note
      </Button>
      {withPageControl && (
        <Button
          type="button"
          variant="secondary"
          onClick={() => setDayClicks((n) => n + 1)}
        >
          Calendar day ({dayClicks})
        </Button>
      )}
      <AddItemPanel
        open={open}
        onClose={() => {
          onClose();
          setContent("");
          setOpen(false);
        }}
        title="New note"
        titleId="story-new-note-title"
        closeLabel="Close"
        modal={modal}
      >
        <form id="story-note-form" onSubmit={(event) => event.preventDefault()}>
          <TextAreaField
            id="story-note-content"
            label="Content"
            value={content}
            onChange={(event) => setContent(event.target.value)}
          />
        </form>
        {withFooter && (
          <AddItemPanelFooter>
            <Button type="submit" form="story-note-form">
              Add note
            </Button>
          </AddItemPanelFooter>
        )}
      </AddItemPanel>
    </>
  );
}

const meta = {
  title: "UI/AddItemPanel",
  component: AddItemPanel,
  tags: ["autodocs"],
  parameters: { viewport: { options: VIEWPORTS } },
  argTypes: {
    modal: {
      description:
        "false opens a non-modal drawer on lg+ so the page stays interactive; below lg it is always a modal sheet",
      control: { type: "boolean" },
    },
  },
  args: {
    open: false,
    onClose: fn(),
    title: "New note",
    titleId: "story-new-note-title",
    closeLabel: "Close",
    children: null,
  },
  render: ({ modal, onClose }) => <PanelDemo modal={modal} onClose={onClose} />,
} satisfies Meta<typeof AddItemPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ModalSheet: Story = {
  globals: { viewport: { value: "mobile", isRotated: false } },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole("button", { name: "Add note" }));

    await expect(canvas.getByRole("dialog", { name: "New note" })).toBeVisible();
    await expect(canvas.getByLabelText("Content")).toHaveFocus();

    await userEvent.click(canvas.getByRole("button", { name: "Close" }));
    await expect(args.onClose).toHaveBeenCalledOnce();
    await expect(canvas.getByRole("button", { name: "Add note" })).toHaveFocus();
  },
};

export const DesktopDrawer: Story = {
  globals: { viewport: { value: "desktop", isRotated: false } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole("button", { name: "Add note" }));

    await expect(canvas.getByRole("dialog", { name: "New note" })).toBeVisible();
    await expect(canvas.getByLabelText("Content")).toHaveFocus();
  },
};

export const NonModalDrawer: Story = {
  args: { modal: false },
  globals: { viewport: { value: "desktop", isRotated: false } },
  render: ({ modal, onClose }) => (
    <PanelDemo modal={modal} onClose={onClose} withPageControl />
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole("button", { name: "Add note" }));

    const dialog = canvas.getByRole("dialog", { name: "New note" });
    await expect(dialog).toBeVisible();

    await userEvent.click(
      canvas.getByRole("button", { name: "Calendar day (0)" }),
    );
    const calendarDay = canvas.getByRole("button", {
      name: "Calendar day (1)",
    });
    await expect(calendarDay).toHaveFocus();
    await expect(dialog).toBeVisible();

    await userEvent.keyboard("{Escape}");
    await expect(args.onClose).toHaveBeenCalledOnce();
    await expect(calendarDay).toHaveFocus();
  },
};

export const WithFooter: Story = {
  globals: { viewport: { value: "desktop", isRotated: false } },
  render: ({ modal, onClose }) => (
    <PanelDemo modal={modal} onClose={onClose} withFooter />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole("button", { name: "Add note" }));

    const dialog = canvas.getByRole("dialog", { name: "New note" });
    const submit = within(dialog).getByRole("button", { name: "Add note" });
    await expect(submit).toBeVisible();

    await expect(canvas.getByLabelText("Content")).toHaveFocus();
    await userEvent.tab();
    await expect(submit).toHaveFocus();
  },
};
