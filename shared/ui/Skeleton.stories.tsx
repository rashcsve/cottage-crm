import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { Skeleton } from "./Skeleton";
import { Surface } from "./Surface";

const meta = {
  title: "UI/Skeleton",
  component: Skeleton,
  tags: ["autodocs"],
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Line: Story = {
  render: () => <Skeleton data-testid="skeleton" className="h-4 w-48" />,
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByTestId("skeleton"),
    ).toHaveAttribute("aria-hidden", "true");
  },
};

export const RowsInSheet: Story = {
  render: () => (
    <Surface padding="default" className="max-w-md space-y-3">
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-2/3" />
    </Surface>
  ),
};
