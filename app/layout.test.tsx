import { readFileSync } from "node:fs";
import path from "node:path";
import { isValidElement } from "react";
import type { ReactElement, ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

const fontMocks = vi.hoisted(() => {
  const createLoader = (variable: string) =>
    vi.fn(() => ({ variable, className: "", style: { fontFamily: "" } }));

  return {
    Schibsted_Grotesk: createLoader("schibsted-variable"),
    Spline_Sans_Mono: createLoader("spline-variable"),
  };
});

vi.mock("next/font/google", () => fontMocks);

vi.mock("next-intl/server", () => ({
  getLocale: vi.fn(async () => "cs"),
}));

type ElementWithProps = ReactElement<{ className?: string; lang?: string; children?: ReactNode }>;

async function renderLayout() {
  const { default: RootLayout } = await import("./layout");
  const html = (await RootLayout({ children: <main /> })) as ElementWithProps;
  const body = html.props.children;

  if (!isValidElement(body)) {
    throw new Error("Expected <html> to render a <body> element");
  }

  return { html, body: body as ElementWithProps };
}

describe("RootLayout", () => {
  it("loads Schibsted Grotesk and Spline Sans Mono with Czech glyphs", async () => {
    await renderLayout();

    for (const loader of [fontMocks.Schibsted_Grotesk, fontMocks.Spline_Sans_Mono]) {
      expect(loader).toHaveBeenCalledWith(
        expect.objectContaining({
          subsets: expect.arrayContaining(["latin", "latin-ext"]),
          display: "swap",
        }),
      );
    }

    expect(fontMocks.Schibsted_Grotesk).toHaveBeenCalledWith(
      expect.objectContaining({ variable: "--font-schibsted-grotesk" }),
    );
    expect(fontMocks.Spline_Sans_Mono).toHaveBeenCalledWith(
      expect.objectContaining({ variable: "--font-spline-sans-mono" }),
    );
  });

  it("sets the font variables on <html> so :root tokens can resolve them", async () => {
    const { html } = await renderLayout();

    expect(html.type).toBe("html");
    expect(html.props.lang).toBe("cs");
    expect(html.props.className).toContain("schibsted-variable");
    expect(html.props.className).toContain("spline-variable");
  });
});

describe("viewport", () => {
  it("tints the browser and status bar with the page color", async () => {
    const { viewport } = await import("./layout");
    const css = readFileSync(path.join(process.cwd(), "app/globals.css"), "utf8");
    const pageColor = css.match(/--color-page:\s*(#[0-9a-fA-F]{6})/)?.[1];

    expect(pageColor).toBeDefined();
    expect(viewport.themeColor).toBe(pageColor);
  });

  it("extends under the notch and home indicator so safe-area padding applies", async () => {
    const { viewport } = await import("./layout");

    expect(viewport.viewportFit).toBe("cover");
  });

  it("exposes every safe-area inset as a token with a zero fallback", () => {
    const css = readFileSync(path.join(process.cwd(), "app/globals.css"), "utf8");

    for (const side of ["top", "right", "bottom", "left"]) {
      expect(css).toContain(`--safe-area-${side}: env(safe-area-inset-${side}, 0px);`);
    }
  });
});
