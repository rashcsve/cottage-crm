import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { Plus } from "lucide-react";
import { Button } from "./Button";
import { MobileActionBar } from "./MobileActionBar";

const VIEWPORTS = {
  mobile: {
    name: "Mobile (390px)",
    styles: { width: "390px", height: "844px" },
    type: "mobile",
  },
};

const meta = {
  title: "UI/MobileActionBar",
  component: MobileActionBar,
  parameters: { layout: "fullscreen", viewport: { options: VIEWPORTS } },
  globals: { viewport: { value: "mobile", isRotated: false } },
  tags: ["autodocs"],
  argTypes: {
    children: {
      description:
        "Primary action pinned above the mobile bottom navigation; hidden at lg+",
      control: false,
    },
  },
} satisfies Meta<typeof MobileActionBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithShortContent: Story = {
  args: {
    children: (
      <Button type="button" className="w-full min-h-12">
        <Plus className="size-4 shrink-0" aria-hidden="true" />
        New task
      </Button>
    ),
  },
  render: (args) => (
    <div className="p-5">
      <p className="text-sm text-ink-secondary">One task left.</p>
      <MobileActionBar {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole("button", { name: "New task" }),
    ).toBeVisible();
  },
};

export const WithLongContent: Story = {
  args: WithShortContent.args,
  render: (args) => (
    <div className="space-y-3 p-5">
      {Array.from({ length: 30 }, (_, index) => (
        <p key={index} className="text-sm text-ink-secondary">
          Row {index + 1}
        </p>
      ))}
      <MobileActionBar {...args} />
    </div>
  ),
};
