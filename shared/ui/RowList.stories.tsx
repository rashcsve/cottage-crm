import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { RowList, RowListItem } from "./RowList";
import { Surface } from "./Surface";

const meta = {
  title: "UI/RowList",
  component: RowList,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <Surface padding="default" className="max-w-md">
        <Story />
      </Surface>
    ),
  ],
} satisfies Meta<typeof RowList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    "aria-label": "Supplies",
    children: [
      <RowListItem key="1">Firewood</RowListItem>,
      <RowListItem key="2">Matches</RowListItem>,
      <RowListItem key="3">Coffee</RowListItem>,
    ],
  },
  play: async ({ canvasElement }) => {
    const list = within(canvasElement).getByRole("list", { name: "Supplies" });
    await expect(within(list).getAllByRole("listitem")).toHaveLength(3);
  },
};

export const WithTwoLineTitles: Story = {
  args: {
    "aria-label": "To-dos",
    children: [
      <RowListItem key="1">
        <div className="min-w-0">
          <p className="text-base font-semibold">
            Vyčistit okapy na severní straně chaty před zimou a zkontrolovat svody
          </p>
          <p className="font-mono text-xs text-ink-muted">pá 23. 10.</p>
        </div>
      </RowListItem>,
      <RowListItem key="2">
        <div className="min-w-0">
          <p className="text-base font-semibold">Napustit vodu</p>
          <p className="font-mono text-xs text-ink-muted">so 24. 10.</p>
        </div>
      </RowListItem>,
    ],
  },
};
