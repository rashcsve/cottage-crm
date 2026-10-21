import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { FormMessage } from "./FormMessage";

describe("FormMessage", () => {
  it("announces success politely with an icon and text", () => {
    render(<FormMessage type="success" message="Saved." />);

    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-live", "polite");
    expect(status).toHaveTextContent("Saved.");
    expect(status.querySelector('svg[aria-hidden="true"]')).not.toBeNull();
  });

  it("announces errors assertively with an icon and text", () => {
    render(<FormMessage type="error" message="Something went wrong." />);

    const alert = screen.getByRole("alert");
    expect(alert).toHaveAttribute("aria-live", "assertive");
    expect(alert).toHaveTextContent("Something went wrong.");
    expect(alert.querySelector('svg[aria-hidden="true"]')).not.toBeNull();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
