import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { StatusBadge } from "./StatusBadge";

const meta = {
  title: "UI/StatusBadge",
  component: StatusBadge,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    tone: {
      description: "Semantic urgency of the status",
      control: { type: "radio" },
      options: ["neutral", "success", "warning"],
    },
    size: {
      description: "Use compact in dense contexts such as table rows",
      control: { type: "radio" },
      options: ["default", "compact"],
    },
    children: {
      description: "Status label — short text or number",
      control: { type: "text" },
    },
  },
} satisfies Meta<typeof StatusBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Neutral: Story = {
  args: { tone: "neutral", children: "Draft" },
};

export const Success: Story = {
  args: { tone: "success", children: "Done" },
};

export const Warning: Story = {
  args: { tone: "warning", children: "Overdue" },
};

export const Compact: Story = {
  args: { tone: "neutral", size: "compact", children: "Draft" },
};

export const WithCount: Story = {
  args: { tone: "neutral", children: 42 },
};

export const WhenLabelIsLong: Story = {
  args: { tone: "warning", children: "Due on 15 December 2025" },
};
