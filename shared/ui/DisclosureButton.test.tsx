import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { useDisclosure } from "@/shared/hooks/useDisclosure";
import { DisclosureButton } from "@/shared/ui/DisclosureButton";

function Harness() {
  const disclosure = useDisclosure();

  return (
    <>
      <DisclosureButton disclosure={disclosure}>Details</DisclosureButton>
      <p id={disclosure.panelId} hidden={!disclosure.isExpanded}>
        Panel text
      </p>
      <button type="button" onClick={disclosure.collapse}>
        Collapse
      </button>
    </>
  );
}

describe("DisclosureButton", () => {
  it("controls its panel and toggles aria-expanded", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    const button = screen.getByRole("button", { name: "Details" });
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(button).toHaveAttribute(
      "aria-controls",
      screen.getByText("Panel text").id,
    );

    await user.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Panel text")).toBeVisible();

    await user.click(button);
    expect(button).toHaveAttribute("aria-expanded", "false");
  });

  it("collapses on demand", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByRole("button", { name: "Details" }));
    await user.click(screen.getByRole("button", { name: "Collapse" }));

    expect(screen.getByRole("button", { name: "Details" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });
});
