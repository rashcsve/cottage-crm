import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { expect, fn, userEvent, within } from "storybook/test";

import { AddItemFormPanel } from "./AddItemFormPanel";
import { Button } from "./Button";
import { TextField } from "./Form/Field";

function FormPanelDemo({ onClose }: { onClose: () => void }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button type="button" onClick={() => setOpen(true)}>
        Add item
      </Button>
      <AddItemFormPanel
        open={open}
        onClose={() => {
          onClose();
          setOpen(false);
        }}
        title="New item"
        titleId="story-new-item-title"
        closeLabel="Close"
      >
        <form onSubmit={(event) => event.preventDefault()}>
          <TextField id="story-new-item" type="text" label="Item" />
        </form>
      </AddItemFormPanel>
    </>
  );
}

const meta = {
  title: "UI/AddItemFormPanel",
  component: AddItemFormPanel,
  tags: ["autodocs"],
  args: {
    open: false,
    onClose: fn(),
    title: "New item",
    titleId: "story-new-item-title",
    closeLabel: "Close",
    children: null,
  },
  render: ({ onClose }) => <FormPanelDemo onClose={onClose} />,
} satisfies Meta<typeof AddItemFormPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const MountsFormWhileOpen: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement.ownerDocument.body);

    await expect(canvas.queryByLabelText("Item")).not.toBeInTheDocument();

    await userEvent.click(canvas.getByRole("button", { name: "Add item" }));
    await expect(canvas.getByRole("dialog", { name: "New item" })).toBeVisible();
    await expect(canvas.getByLabelText("Item")).toBeInTheDocument();

    await userEvent.click(canvas.getByRole("button", { name: "Close" }));
    await expect(args.onClose).toHaveBeenCalledOnce();
    await expect(canvas.queryByLabelText("Item")).not.toBeInTheDocument();
  },
};
