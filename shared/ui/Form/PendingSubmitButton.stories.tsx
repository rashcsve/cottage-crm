import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { PendingSubmitButton } from "./PendingSubmitButton";

const meta = {
  title: "UI/Form/PendingSubmitButton",
  component: PendingSubmitButton,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    isPending: {
      description: "Disables the button and shows the pending label",
      control: { type: "boolean" },
    },
    label: {
      description: "Label shown when idle",
      control: { type: "text" },
    },
    pendingLabel: {
      description: "Label shown while submitting; the width fits the longer label",
      control: { type: "text" },
    },
  },
  args: { label: "Add", pendingLabel: "Saving…" },
} satisfies Meta<typeof PendingSubmitButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Idle: Story = {
  args: { isPending: false },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole("button", { name: "Add" }),
    ).toBeEnabled();
  },
};

export const Pending: Story = {
  args: { isPending: true },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole("button", { name: "Saving…" }),
    ).toBeDisabled();
  },
};
