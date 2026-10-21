import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Surface } from "./Surface";
import { RowList, RowListItem } from "./RowList";

const meta = {
  title: "UI/Surface",
  component: Surface,
  tags: ["autodocs"],
  argTypes: {
    padding: {
      description: "Internal padding — default is 16px on mobile and 24px on desktop",
      control: { type: "radio" },
      options: ["none", "default"],
    },
    as: {
      description: "Rendered element — use section with aria-labelledby for landmarks",
      control: { type: "radio" },
      options: ["div", "section", "article"],
    },
    className: {
      description: "Additional Tailwind classes — use for max-width",
      control: { type: "text" },
    },
  },
} satisfies Meta<typeof Surface>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    padding: "default",
    children: (
      <p className="text-sm text-ink-secondary">Sheet content goes here.</p>
    ),
  },
};

export const WithHairlineRows: Story = {
  render: () => (
    <Surface padding="default" className="max-w-sm">
      <RowList>
        <RowListItem>Firewood</RowListItem>
        <RowListItem>Matches</RowListItem>
        <RowListItem>Coffee</RowListItem>
      </RowList>
    </Surface>
  ),
  args: { children: null },
};

export const AsLabelledSection: Story = {
  render: () => (
    <Surface as="section" padding="default" aria-labelledby="sheet-title" className="max-w-sm">
      <h2 id="sheet-title" className="text-xl font-bold tracking-heading">
        Weather
      </h2>
      <p className="text-sm text-ink-secondary">Clear skies all weekend.</p>
    </Surface>
  ),
  args: { children: null },
};

export const WhenContentOverflows: Story = {
  render: () => (
    <Surface padding="default" className="max-w-xs">
      <p className="wrap-break-word text-sm text-ink-secondary">
        This sheet contains a very long unbroken string:{" "}
        pneumonoultramicroscopicsilicovolcanoconiosis.
      </p>
    </Surface>
  ),
  args: { children: null },
};
