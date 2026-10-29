import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { CheckToggle } from "./CheckToggle";

const meta = {
  title: "UI/CheckToggle",
  component: CheckToggle,
  tags: ["autodocs"],
  args: {
    checked: false,
    label: "Toggle item",
    readOnlyStateLabel: "Not completed",
    onToggle: fn(),
  },
} satisfies Meta<typeof CheckToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Unchecked: Story = {
  play: async ({ args, canvasElement }) => {
    const toggle = within(canvasElement).getByRole("button", {
      name: "Toggle item",
    });
    await expect(toggle).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(toggle);
    await expect(args.onToggle).toHaveBeenCalledTimes(1);
  },
};

export const Checked: Story = {
  args: { checked: true },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole("button", { name: "Toggle item" }),
    ).toHaveAttribute("aria-pressed", "true");
  },
};

export const Pending: Story = {
  args: { pending: true },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole("button", { name: "Toggle item" }),
    ).toBeDisabled();
  },
};

export const Large: Story = {
  args: { checked: true, size: "large" },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole("button", { name: "Toggle item" }),
    ).toHaveAttribute("aria-pressed", "true");
  },
};

export const ReadOnlyChecked: Story = {
  args: { checked: true, readOnly: true, readOnlyStateLabel: "Completed" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
    await expect(canvas.getByText("Completed")).toBeInTheDocument();
  },
};

export const ReadOnlyUnchecked: Story = {
  args: { readOnly: true, readOnlyStateLabel: "Not completed" },
};
