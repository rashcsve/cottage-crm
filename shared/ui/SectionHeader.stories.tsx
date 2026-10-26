import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { TriangleAlert } from "lucide-react";
import { SectionHeader } from "./SectionHeader";
import { StatusLabel } from "./StatusLabel";
import { Button } from "./Button";
import { TextLink } from "./TextLink";

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
      description: "Small sentence-case label above the title — use for section context",
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
      badge={<StatusLabel tone="neutral">12</StatusLabel>}
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
      badge={<StatusLabel tone="neutral">12</StatusLabel>}
      actions={<Button variant="primary">Add task</Button>}
    />
  ),
  args: { title: "" },
};

export const WithTextLink: Story = {
  render: () => (
    <SectionHeader
      title="Latest notes"
      actions={<TextLink href="/notes">All notes</TextLink>}
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
      badge={
        <StatusLabel tone="warning" icon={TriangleAlert}>
          3 overdue
        </StatusLabel>
      }
      actions={<Button variant="primary">Add task</Button>}
    />
  ),
  args: { title: "" },
};
