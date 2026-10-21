import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CalendarClock, Check, Clock, LogIn, TriangleAlert } from "lucide-react";
import { expect, within } from "storybook/test";
import { StatusLabel } from "./StatusLabel";

const meta = {
  title: "UI/StatusLabel",
  component: StatusLabel,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof StatusLabel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Danger: Story = {
  args: { tone: "danger", icon: TriangleAlert, children: "Overdue since 12 Oct" },
  play: async ({ canvasElement }) => {
    const label = within(canvasElement).getByText("Overdue since 12 Oct");
    await expect(label.parentElement?.querySelector("svg")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  },
};

export const Warning: Story = {
  args: { tone: "warning", icon: Clock, children: "Due today" },
};

export const Success: Story = {
  args: { tone: "success", icon: LogIn, children: "Occupied" },
};

export const NeutralWithIcon: Story = {
  args: { tone: "neutral", icon: CalendarClock, children: "Upcoming" },
};

export const NeutralWordsOnly: Story = {
  args: { tone: "neutral", children: "High priority" },
};

export const Done: Story = {
  args: {
    tone: "neutral",
    icon: Check,
    className: "text-ink-muted",
    children: "Done by Jana",
  },
};

export const WhenLabelIsLong: Story = {
  args: {
    tone: "danger",
    icon: TriangleAlert,
    children: "Po termínu od 12. 10. — zkontrolovat zásoby dřeva",
  },
};
