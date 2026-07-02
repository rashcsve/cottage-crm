import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { StatCard } from "./StatCard";

const meta = {
  title: "UI/StatCard",
  component: StatCard,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    label: {
      description: "Metric name shown above the value",
      control: { type: "text" },
    },
    value: {
      description: "Numeric or formatted string value",
      control: { type: "text" },
    },
  },
} satisfies Meta<typeof StatCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { label: "Total visits", value: 24 },
};

export const WithDateValue: Story = {
  args: { label: "Next stay", value: "Aug 12" },
};

export const WithLargeNumber: Story = {
  args: { label: "Days since last visit", value: 1284 },
};

export const WhenLabelOverflows: Story = {
  args: { label: "Average stay duration in days", value: 7 },
};

export const InAGrid: Story = {
  render: () => (
    <div className="grid grid-cols-3 gap-3">
      <StatCard label="Total visits" value={24} />
      <StatCard label="This year" value={8} />
      <StatCard label="Next stay" value="Aug 12" />
    </div>
  ),
  args: { label: "x", value: 0 },
};
