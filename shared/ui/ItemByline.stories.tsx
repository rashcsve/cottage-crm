import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { ItemByline } from "./ItemByline";

const now = new Date("2026-10-14T12:00:00.000Z");

const meta = {
  title: "UI/ItemByline",
  component: ItemByline,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: { locale: "en", now },
} satisfies Meta<typeof ItemByline>;

export default meta;
type Story = StoryObj<typeof meta>;

export const MinutesAgo: Story = {
  args: {
    name: "Anna",
    label: "Added by Anna",
    dateTime: "2026-10-14T11:45:00.000Z",
  },
  play: async ({ canvasElement }) => {
    const time = within(canvasElement).getByText("15 minutes ago");
    await expect(time).toHaveAttribute("title");
  },
};

export const DaysAgo: Story = {
  args: {
    name: "Anna",
    label: "Added by Anna",
    dateTime: "2026-10-11T12:00:00.000Z",
  },
};

export const OlderThanAWeek: Story = {
  args: {
    name: "Petr",
    label: "Added by Petr",
    dateTime: "2026-09-02T08:30:00.000Z",
  },
};

export const WithoutName: Story = {
  args: { label: "Added", dateTime: "2026-10-14T09:00:00.000Z" },
};

export const Czech: Story = {
  args: {
    locale: "cs",
    name: "Jana Nováková",
    label: "Přidala Jana Nováková",
    dateTime: "2026-10-12T12:00:00.000Z",
  },
};
