import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Surface } from "./Surface";

const meta = {
  title: "UI/Surface",
  component: Surface,
  tags: ["autodocs"],
  argTypes: {
    className: {
      description: "Additional Tailwind classes — use for padding and max-width",
      control: { type: "text" },
    },
  },
} satisfies Meta<typeof Surface>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Surface className="p-4">
      <p className="text-sm text-ink-secondary">Card content goes here.</p>
    </Surface>
  ),
  args: { children: null },
};

export const WithInternalDivider: Story = {
  render: () => (
    <Surface className="max-w-sm">
      <div className="border-b border-border p-4">
        <h3 className="text-sm font-semibold text-ink">Section title</h3>
      </div>
      <div className="p-4">
        <p className="text-sm text-ink-secondary">Card body content.</p>
      </div>
    </Surface>
  ),
  args: { children: null },
};

export const Nested: Story = {
  render: () => (
    <Surface className="max-w-sm p-4">
      <p className="mb-3 text-sm font-semibold text-ink">Outer card</p>
      <Surface className="p-3">
        <p className="text-sm text-ink-secondary">Inner card content.</p>
      </Surface>
    </Surface>
  ),
  args: { children: null },
};

export const WhenContentOverflows: Story = {
  render: () => (
    <Surface className="max-w-xs p-4">
      <p className="text-sm text-ink-secondary">
        This card contains a very long unbroken string:{" "}
        pneumonoultramicroscopicsilicovolcanoconiosis.
      </p>
    </Surface>
  ),
  args: { children: null },
};
