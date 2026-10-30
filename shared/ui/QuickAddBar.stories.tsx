import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";

import { Button } from "./Button";
import { TextField } from "./Form/Field";
import { QuickAddBar } from "./QuickAddBar";

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

const meta = {
  title: "UI/QuickAddBar",
  component: QuickAddBar,
  parameters: { layout: "fullscreen", viewport: { options: VIEWPORTS } },
  globals: { viewport: { value: "mobile", isRotated: false } },
  tags: ["autodocs"],
  args: {
    labels: { button: "Add item", sheetTitle: "New item", close: "Close" },
    titleId: "story-quick-add-title",
    getAddedMessage: (title: string) => `Added ${title}`,
    renderForm: ({ onAdded, onCancel }) => (
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onAdded("Milk");
        }}
      >
        <TextField id="story-quick-add-item" type="text" label="Item" />
        <Button type="submit">Save</Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </form>
    ),
  },
} satisfies Meta<typeof QuickAddBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const MobileOnly: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);

    await userEvent.click(canvas.getByRole("button", { name: "Add item" }));
    await expect(canvas.getByRole("dialog", { name: "New item" })).toBeVisible();

    await userEvent.click(canvas.getByRole("button", { name: "Save" }));
    await expect(canvas.queryByLabelText("Item")).not.toBeInTheDocument();
    await expect(canvas.getByText("Added Milk")).toBeInTheDocument();
  },
};

export const WithHeaderTrigger: Story = {
  globals: { viewport: { value: "desktop", isRotated: false } },
  args: {
    children: (headerTrigger) => (
      <div className="flex items-center justify-between gap-4">
        <h2>Items</h2>
        {headerTrigger}
      </div>
    ),
  },
};
