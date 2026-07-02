import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { Pencil, Trash2, X } from "lucide-react";
import { IconButton } from "./IconButton";

const meta = {
  title: "UI/IconButton",
  component: IconButton,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    size: {
      description: "Touch target size — use compact only in dense table rows",
      control: { type: "radio" },
      options: ["default", "compact"],
    },
    disabled: {
      description: "Prevents interaction and dims the button",
      control: { type: "boolean" },
    },
  },
  args: { size: "default", onClick: fn(), children: null },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: ({ size, onClick }) => (
    <IconButton size={size} onClick={onClick} aria-label="Edit">
      <Pencil className="h-4 w-4" />
    </IconButton>
  ),
  play: async ({ canvasElement, args }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Edit" }));
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};

export const Compact: Story = {
  render: ({ onClick }) => (
    <IconButton size="compact" onClick={onClick} aria-label="Close">
      <X className="h-3.5 w-3.5" />
    </IconButton>
  ),
  args: { size: "compact" },
  play: async ({ canvasElement, args }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Close" }));
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};

export const WhenDisabled: Story = {
  render: ({ size }) => (
    <IconButton size={size} disabled aria-label="Edit">
      <Pencil className="h-4 w-4" />
    </IconButton>
  ),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("button")).toBeDisabled();
  },
};

export const CompactWhenDisabled: Story = {
  render: () => (
    <IconButton size="compact" disabled aria-label="Delete">
      <Trash2 className="h-3.5 w-3.5" />
    </IconButton>
  ),
  args: { size: "compact" },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("button")).toBeDisabled();
  },
};
