import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { EmptyState } from "./EmptyState";
import { Button } from "./Button";

const meta = {
  title: "UI/EmptyState",
  component: EmptyState,
  tags: ["autodocs"],
  argTypes: {
    title: {
      description: "Primary heading shown when the list is empty",
      control: { type: "text" },
    },
    description: {
      description: "Supporting text explaining what the user can do",
      control: { type: "text" },
    },
    titleTag: {
      description: "HTML heading element — match the page heading hierarchy",
      control: { type: "radio" },
      options: ["h2", "h3", "h4"],
    },
  },
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: "No tasks yet",
    description: "Create your first task to get started.",
  },
};

export const WithAction: Story = {
  args: {
    title: "No tasks yet",
    description: "Create your first task to get started.",
    action: <Button variant="primary">Add task</Button>,
  },
};

export const WhenTitleTagIsH2: Story = {
  args: {
    title: "Nothing here",
    description: "Results will appear once data is available.",
    titleTag: "h2",
  },
};

export const WhenContentIsLong: Story = {
  args: {
    title: "No shopping items match the selected filter",
    description:
      "Try clearing the filter or adding new items to the shopping list. Items you add will appear here once the filter matches.",
    action: <Button variant="secondary">Clear filter</Button>,
  },
};
