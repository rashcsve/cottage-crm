import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, mocked, userEvent, waitFor, within } from "storybook/test";

import { signOutAction } from "@/lib/auth/sign-out";

import { AccountMenu } from "./AccountMenu";

const meta = {
  title: "Auth/AccountMenu",
  component: AccountMenu,
  args: {
    accountName: "Jana Nováková",
    accountInitial: "J",
    triggerLabel: "Signed in as Jana Nováková",
    signOutLabel: "Sign Out",
  },
  decorators: [
    (Story) => (
      <div className="flex min-h-48 justify-between">
        <p>Outside content</p>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AccountMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Closed: Story = {};

export const Open: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: args.triggerLabel }));
    await expect(canvas.getByRole("menu")).toBeVisible();
    await expect(canvas.getByRole("menuitem", { name: args.signOutLabel })).toBeVisible();
  },
};

export const KeyboardNavigation: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: args.triggerLabel });
    trigger.focus();
    await userEvent.keyboard("{ArrowDown}");
    await expect(canvas.getByRole("menu")).toHaveFocus();
    await expect(canvas.getByRole("menu")).toHaveAttribute(
      "aria-activedescendant",
      canvas.getByRole("menuitem", { name: args.signOutLabel }).id
    );
    await userEvent.keyboard("{Escape}");
    await expect(canvas.queryByRole("menu")).not.toBeInTheDocument();
    await expect(trigger).toHaveFocus();
  },
};

export const OutsideClick: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: args.triggerLabel });
    await userEvent.click(trigger);
    await userEvent.click(canvas.getByText("Outside content"));
    await expect(canvas.queryByRole("menu")).not.toBeInTheDocument();
    await expect(trigger).toHaveFocus();
  },
};

export const SignOut: Story = {
  beforeEach: () => {
    mocked(signOutAction).mockReturnValue(new Promise<never>(() => {}));
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: args.triggerLabel });
    await userEvent.click(trigger);
    await userEvent.click(canvas.getByRole("menuitem", { name: args.signOutLabel }));
    await waitFor(() => expect(signOutAction).toHaveBeenCalledTimes(1));
    await expect(trigger).toHaveAttribute("aria-disabled", "true");
    await expect(trigger).toHaveFocus();
  },
};
