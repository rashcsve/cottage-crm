import { describe, expect, it, vi } from "vitest";

const { notFoundMock } = vi.hoisted(() => ({
  notFoundMock: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

vi.mock("next/navigation", async (importOriginal) => ({
  ...(await importOriginal<typeof import("next/navigation")>()),
  notFound: notFoundMock,
}));

vi.mock("next-intl/server", () => ({
  getMessages: vi.fn(async () => ({})),
  setRequestLocale: vi.fn(),
  getTranslations: vi.fn(
    async ({ locale }: { locale: string }) =>
      (key: string) =>
        `${locale}.${key}`,
  ),
}));

async function getMetadata(locale: string) {
  const { generateMetadata } = await import("./layout");
  return generateMetadata({ params: Promise.resolve({ locale }) });
}

describe("LocaleLayout generateMetadata", () => {
  it.each([
    ["cs", "/manifest.cs.webmanifest"],
    ["en", "/manifest.en.webmanifest"],
  ])("links the %s manifest", async (locale, manifest) => {
    expect((await getMetadata(locale)).manifest).toBe(manifest);
  });

  it("returns not found for an unsupported locale instead of linking a missing manifest", async () => {
    await expect(getMetadata("de")).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFoundMock).toHaveBeenCalledOnce();
  });

  it("points iOS at the apple touch icon", async () => {
    expect((await getMetadata("cs")).icons).toEqual({
      apple: "/icons/apple-touch-icon.png",
    });
  });

  it("marks the app as home-screen capable on iOS with the short name", async () => {
    expect((await getMetadata("en")).appleWebApp).toEqual({
      capable: true,
      title: "en.shortName",
      statusBarStyle: "default",
    });
  });
});
