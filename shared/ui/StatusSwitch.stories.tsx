import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { StatusSwitch } from "./StatusSwitch";

const meta = {
  title: "UI/StatusSwitch",
  component: StatusSwitch,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="max-w-80">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof StatusSwitch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Shopping: Story = {
  args: {
    activeFilter: "pending",
    ariaLabel: "Stav zásob",
    pathname: "/shopping",
    items: [
      { filter: "pending", label: "Koupit", count: 5, countUnit: "položek" },
      { filter: "purchased", label: "Koupené", count: 12, countUnit: "položek" },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole("link", { name: "Koupit 5 položek" }),
    ).toHaveAttribute("aria-current", "page");
    await expect(
      canvas.getByRole("link", { name: "Koupené 12 položek" }),
    ).not.toHaveAttribute("aria-current");
  },
};

export const Tasks: Story = {
  args: {
    activeFilter: "done",
    ariaLabel: "Task status",
    pathname: "/tasks",
    items: [
      { filter: "open", label: "Open", count: 1, countUnit: "task" },
      { filter: "done", label: "Completed", count: 0, countUnit: "tasks" },
    ],
  },
};
