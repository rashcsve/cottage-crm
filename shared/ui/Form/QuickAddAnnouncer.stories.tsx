import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { QuickAddAnnouncer } from "./QuickAddAnnouncer";

const meta = {
  title: "UI/Form/QuickAddAnnouncer",
  component: QuickAddAnnouncer,
  tags: ["autodocs"],
  argTypes: {
    announcement: {
      description:
        "Text to announce; a new id remounts the text so the same title is announced again",
      control: { type: "object" },
    },
  },
} satisfies Meta<typeof QuickAddAnnouncer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: { announcement: { id: 0, text: "" } },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("status")).toHaveTextContent(
      "",
    );
  },
};

export const Announced: Story = {
  args: { announcement: { id: 1, text: "Added: Milk" } },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("status")).toHaveTextContent(
      "Added: Milk",
    );
  },
};
