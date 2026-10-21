import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { ArrowRight } from "lucide-react";
import { Button } from "./Button";

const meta = {
  title: "UI/Button",
  component: Button,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      description: "Visual weight of the action",
      control: { type: "radio" },
      options: ["primary", "secondary"],
    },
    children: {
      description: "Button label",
      control: { type: "text" },
    },
    disabled: {
      description: "Prevents interaction and dims the button",
      control: { type: "boolean" },
    },
    block: {
      description: "Full width, 48px tall, content spread with space-between",
      control: { type: "boolean" },
    },
  },
  args: { onClick: fn() },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: { children: "Save changes", variant: "primary" },
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole("button", { name: "Save changes" });
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};

export const Secondary: Story = {
  args: { children: "Cancel", variant: "secondary" },
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole("button", { name: "Cancel" });
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};

export const WhenDisabled: Story = {
  args: { children: "Save changes", variant: "primary", disabled: true },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("button")).toBeDisabled();
  },
};

export const SecondaryWhenDisabled: Story = {
  args: { children: "Cancel", variant: "secondary", disabled: true },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("button")).toBeDisabled();
  },
};

export const Block: Story = {
  args: {
    block: true,
    variant: "primary",
    children: (
      <>
        Plan a visit
        <ArrowRight aria-hidden="true" className="size-4" />
      </>
    ),
  },
  parameters: { layout: "padded" },
  play: async ({ canvasElement, args }) => {
    await userEvent.click(
      within(canvasElement).getByRole("button", { name: "Plan a visit" }),
    );
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};

export const WithLongLabel: Story = {
  args: {
    children: "Save all pending changes to the database",
    variant: "primary",
  },
  play: async ({ canvasElement, args }) => {
    await userEvent.click(within(canvasElement).getByRole("button"));
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};
