import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { TextLink } from "./TextLink";

const meta = {
  title: "UI/TextLink",
  component: TextLink,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    children: {
      description: "Link text — the trailing arrow is added automatically",
      control: { type: "text" },
    },
  },
} satisfies Meta<typeof TextLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { href: "/notes", children: "All notes" },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole("link", { name: "All notes" }),
    ).toBeVisible();
  },
};

export const WithLongCzechLabel: Story = {
  args: { href: "/shopping", children: "Všechny zásoby na chatě" },
};
