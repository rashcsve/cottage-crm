import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SectionHeader } from "./SectionHeader";
import { StatusBadge } from "./StatusBadge";
import { Button } from "./Button";

const meta = {
  title: "UI/SectionHeader",
  component: SectionHeader,
  tags: ["autodocs"],
  argTypes: {
    title: {
      description: "Main heading text",
      control: { type: "text" },
    },
    eyebrow: {
      description: "Small uppercase label above the title — use for section context",
      control: { type: "text" },
    },
    description: {
      description: "Supporting text below the title",
      control: { type: "text" },
    },
    titleTag: {
      description: "HTML heading element — match the page heading hierarchy",
      control: { type: "radio" },
      options: ["h2", "h3", "h4"],
    },
  },
} satisfies Meta<typeof SectionHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: "Tasks",
    description: "Manage household maintenance and chores.",
  },
};

export const WithoutDescription: Story = {
  args: { title: "Tasks" },
};

export const WithEyebrow: Story = {
  args: {
    eyebrow: "Overview",
    title: "Tasks",
    description: "Manage household maintenance and chores.",
  },
};

export const WithBadge: Story = {
  render: () => (
    <SectionHeader
      title="Tasks"
      badge={<StatusBadge tone="neutral">12</StatusBadge>}
      description="Manage household maintenance and chores."
    />
  ),
  args: { title: "" },
};

export const WithActions: Story = {
  render: () => (
    <SectionHeader
      eyebrow="Overview"
      title="Tasks"
      description="Manage household maintenance and chores."
      badge={<StatusBadge tone="neutral">12</StatusBadge>}
      actions={<Button variant="primary">Add task</Button>}
    />
  ),
  args: { title: "" },
};

export const WhenTitleIsLong: Story = {
  render: () => (
    <SectionHeader
      eyebrow="Overview"
      title="All household maintenance tasks and chores for the upcoming season"
      description="Track and assign maintenance work across all areas of the cottage."
      badge={<StatusBadge tone="warning">3 overdue</StatusBadge>}
      actions={<Button variant="primary">Add task</Button>}
    />
  ),
  args: { title: "" },
};
