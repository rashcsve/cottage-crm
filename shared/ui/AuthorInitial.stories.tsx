import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { AuthorInitial } from "./AuthorInitial";

const meta = {
  title: "UI/AuthorInitial",
  component: AuthorInitial,
  tags: ["autodocs"],
} satisfies Meta<typeof AuthorInitial>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    author: "Šárka",
    locale: "cs",
  },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("Š")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  },
};

export const WhenAuthorIsEmpty: Story = {
  args: {
    author: "",
    locale: "cs",
  },
};
