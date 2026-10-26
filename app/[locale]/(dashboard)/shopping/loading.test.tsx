import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ShoppingLoading from "./loading";

vi.mock("next-intl/server", async () => {
  const { createNamespacedTranslatorMock } = await import(
    "@/tests/utils/create-server-translations-mock"
  );

  return {
    getTranslations: vi.fn(async (namespace: string) =>
      createNamespacedTranslatorMock(namespace),
    ),
  };
});

describe("ShoppingLoading", () => {
  it("announces loading to assistive technology and marks the content busy", async () => {
    const { container } = render(await ShoppingLoading());

    expect(screen.getByRole("status")).toHaveTextContent("common.loading");
    expect(container.querySelector('[aria-busy="true"]')).not.toBeNull();
  });
});
