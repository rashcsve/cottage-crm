import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { FormMessage } from "./FormMessage";

const meta = {
  title: "UI/FormMessage",
  component: FormMessage,
  tags: ["autodocs"],
  argTypes: {
    type: {
      description: "Success uses role=status (polite); error uses role=alert (assertive)",
      control: { type: "radio" },
      options: ["success", "error"],
    },
    message: {
      description: "Feedback text shown to the user",
      control: { type: "text" },
    },
  },
} satisfies Meta<typeof FormMessage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = {
  args: { type: "success", message: "Your changes have been saved." },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("status")).toBeInTheDocument();
  },
};

export const Error: Story = {
  args: { type: "error", message: "Something went wrong. Please try again." },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("alert")).toBeInTheDocument();
  },
};

export const WhenMessageIsLong: Story = {
  args: {
    type: "error",
    message:
      "We were unable to save your changes because the title field is required and the description exceeds the maximum allowed length of 500 characters. Please review and correct the highlighted fields before submitting.",
  },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("alert")).toBeInTheDocument();
  },
};
