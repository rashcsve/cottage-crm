import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import cs from "@/i18n/locales/cs.json";
import en from "@/i18n/locales/en.json";

const PUBLIC_DIR = path.join(process.cwd(), "public");
const PNG_COLOR_TYPES_WITH_ALPHA = [4, 6];

const iconSchema = z.object({
  src: z.string(),
  sizes: z.string(),
  type: z.string(),
  purpose: z.string().optional(),
});

const manifestSchema = z.object({
  id: z.string(),
  name: z.string(),
  short_name: z.string(),
  description: z.string(),
  lang: z.string(),
  start_url: z.string(),
  scope: z.string(),
  display: z.string(),
  background_color: z.string(),
  theme_color: z.string(),
  icons: z.array(iconSchema),
});

function readPublicFile(publicPath: string): Buffer {
  return readFileSync(path.join(PUBLIC_DIR, publicPath));
}

function readManifest(locale: string) {
  const raw: unknown = JSON.parse(
    readPublicFile(`manifest.${locale}.webmanifest`).toString("utf8"),
  );
  return manifestSchema.parse(raw);
}

function readPngHeader(publicPath: string) {
  const bytes = readPublicFile(publicPath);

  expect(bytes.subarray(1, 4).toString("ascii")).toBe("PNG");
  expect(bytes.subarray(12, 16).toString("ascii")).toBe("IHDR");

  return {
    width: bytes.readUInt32BE(16),
    height: bytes.readUInt32BE(20),
    colorType: bytes.readUInt8(25),
  };
}

function readPageColor(): string {
  const css = readFileSync(path.join(process.cwd(), "app/globals.css"), "utf8");
  const match = css.match(/--color-page:\s*(#[0-9a-fA-F]{6})/);

  if (!match) {
    throw new Error("Expected --color-page in app/globals.css");
  }

  return match[1];
}

describe.each([
  { locale: "cs", messages: cs, startUrl: "/overview" },
  { locale: "en", messages: en, startUrl: "/en/overview" },
])("$locale web app manifest",({ locale, messages, startUrl }) => {
  it("uses the locale's metadata texts", () => {
    const manifest = readManifest(locale);

    expect(manifest.name).toBe(messages.metadata.title);
    expect(manifest.short_name).toBe(messages.metadata.shortName);
    expect(manifest.description).toBe(messages.metadata.description);
  });

  it("starts standalone on the locale's overview", () => {
    const manifest = readManifest(locale);

    expect(manifest).toMatchObject({
      id: startUrl,
      start_url: startUrl,
      scope: "/",
      lang: locale,
      display: "standalone",
    });
  });

  it("uses the page color for background and theme", () => {
    const manifest = readManifest(locale);

    expect(manifest.background_color).toBe(readPageColor());
    expect(manifest.theme_color).toBe(readPageColor());
  });

  it("lists existing PNG icons whose dimensions match their sizes", () => {
    const { icons } = readManifest(locale);

    expect(icons.map((icon) => icon.sizes)).toEqual(
      expect.arrayContaining(["192x192", "512x512"]),
    );

    for (const icon of icons) {
      expect(icon.src.startsWith("/icons/")).toBe(true);
      expect(icon.type).toBe("image/png");
      expect(existsSync(path.join(PUBLIC_DIR, icon.src))).toBe(true);

      const { width, height } = readPngHeader(icon.src);
      expect(`${width}x${height}`).toBe(icon.sizes);
    }
  });

  it("has exactly one maskable icon", () => {
    const { icons } = readManifest(locale);

    expect(icons.filter((icon) => icon.purpose === "maskable")).toHaveLength(1);
  });
});

describe("icon files", () => {
  it("keeps the SVG source next to the rasterized icons", () => {
    expect(existsSync(path.join(PUBLIC_DIR, "icons/icon.svg"))).toBe(true);
  });

  it("provides an opaque 180x180 apple touch icon", () => {
    const { width, height, colorType } = readPngHeader("/icons/apple-touch-icon.png");

    expect(`${width}x${height}`).toBe("180x180");
    expect(PNG_COLOR_TYPES_WITH_ALPHA).not.toContain(colorType);
  });

  it("provides an opaque maskable icon so launchers never show transparent corners", () => {
    const { colorType } = readPngHeader("/icons/icon-maskable-512.png");

    expect(PNG_COLOR_TYPES_WITH_ALPHA).not.toContain(colorType);
  });
});
