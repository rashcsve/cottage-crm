import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { Surface } from "@/shared/ui/Surface";
import { QuickAddPlaceholder } from "./QuickAddPlaceholder";

const meta = {
  title: "UI/Form/QuickAddPlaceholder",
  component: QuickAddPlaceholder,
  tags: ["autodocs"],
  argTypes: {
    withDetailsRow: {
      description: "Reserves space for a details toggle under the input",
      control: { type: "boolean" },
    },
  },
  args: { testId: "quick-add-placeholder" },
  decorators: [
    (Story) => (
      <Surface className="max-w-md px-4 py-3">
        <Story />
      </Surface>
    ),
  ],
} satisfies Meta<typeof QuickAddPlaceholder>;

export default meta;
type Story = StoryObj<typeof meta>;

export const InputOnly: Story = {
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByTestId("quick-add-placeholder"),
    ).toHaveAttribute("aria-hidden", "true");
  },
};

export const WithDetailsRow: Story = {
  args: { withDetailsRow: true },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByTestId("quick-add-placeholder")
        .childElementCount,
    ).toBe(2);
  },
};
