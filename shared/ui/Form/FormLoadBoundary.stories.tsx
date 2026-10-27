import { lazy } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { FormLoadBoundary } from "./FormLoadBoundary";

function BrokenForm(): never {
  throw new Error("ChunkLoadError");
}

const PendingForm = lazy(() => new Promise<never>(() => {}));

const meta = {
  title: "UI/Form/FormLoadBoundary",
  component: FormLoadBoundary,
  tags: ["autodocs"],
  args: {
    message:
      "The form could not be loaded. Check your connection and reload the page.",
    reloadLabel: "Reload page",
    loadingLabel: "Loading...",
    onReload: fn(),
    children: <BrokenForm />,
  },
} satisfies Meta<typeof FormLoadBoundary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Loading: Story = {
  args: { children: <PendingForm /> },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole("status")).toHaveTextContent("Loading...");
  },
};

export const LoadFailed: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole("alert")).toHaveTextContent(
      "The form could not be loaded.",
    );
    await userEvent.click(canvas.getByRole("button", { name: "Reload page" }));
    await expect(args.onReload).toHaveBeenCalledTimes(1);
  },
};
