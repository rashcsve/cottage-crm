import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import { useDisclosure } from "@/shared/hooks/useDisclosure";
import { DisclosureButton } from "./DisclosureButton";

function DisclosureDemo({ label }: { label: string }) {
  const disclosure = useDisclosure();

  return (
    <div>
      <DisclosureButton disclosure={disclosure}>{label}</DisclosureButton>
      <p id={disclosure.panelId} hidden={!disclosure.isExpanded}>
        The boiler shows error E4 again, a restart helped.
      </p>
    </div>
  );
}

const meta = {
  title: "UI/DisclosureButton",
  component: DisclosureDemo,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: { label: "Show more" },
} satisfies Meta<typeof DisclosureDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Collapsed: Story = {};

export const Expanded: Story = {
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole("button", {
      name: "Show more",
    });
    await userEvent.click(button);
    await expect(button).toHaveAttribute("aria-expanded", "true");
  },
};
