import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { downscaleNotePhoto } from "@/features/notes/shared/downscaleNotePhoto";

const OPTIONS = { maxEdgePx: 2048, quality: 0.82 };

type MockBitmap = { width: number; height: number; close: ReturnType<typeof vi.fn> };

function stubBitmap(width: number, height: number): MockBitmap {
  const bitmap = { width, height, close: vi.fn() };
  vi.stubGlobal("createImageBitmap", vi.fn().mockResolvedValue(bitmap));
  return bitmap;
}

type EncodedResult = string | { type: string; size: number } | null;

function stubToBlob(results: EncodedResult[]) {
  const queue = [...results];

  return vi
    .spyOn(HTMLCanvasElement.prototype, "toBlob")
    .mockImplementation(function (callback: BlobCallback) {
      const result = queue.shift() ?? null;
      if (result === null) {
        callback(null);
      } else if (typeof result === "string") {
        callback(new Blob(["encoded"], { type: result }));
      } else {
        callback(new Blob([new Uint8Array(result.size)], { type: result.type }));
      }
    });
}

describe("features/notes/shared/downscaleNotePhoto", () => {
  let drawImage: ReturnType<typeof vi.fn>;
  let fillRect: ReturnType<typeof vi.fn>;
  let context: { drawImage: typeof drawImage; fillRect: typeof fillRect; fillStyle: string };
  let canvases: HTMLCanvasElement[];

  beforeEach(() => {
    drawImage = vi.fn();
    fillRect = vi.fn();
    context = { drawImage, fillRect, fillStyle: "" };
    canvases = [];

    const createElement = document.createElement.bind(document);
    vi.spyOn(document, "createElement").mockImplementation(
      (tagName: string, options?: ElementCreationOptions) => {
        const element = createElement(tagName, options);
        if (element instanceof HTMLCanvasElement) {
          canvases.push(element);
        }
        return element;
      }
    );

    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(
      () => context as unknown as CanvasRenderingContext2D
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("decodes with the EXIF orientation applied", async () => {
    stubBitmap(4000, 3000);
    stubToBlob(["image/webp"]);
    const file = new File(["photo"], "porch.jpg", { type: "image/jpeg" });

    await downscaleNotePhoto(file, OPTIONS);

    expect(createImageBitmap).toHaveBeenCalledWith(file, {
      imageOrientation: "from-image",
    });
  });

  it("scales the long edge down to maxEdgePx and keeps the aspect ratio", async () => {
    const bitmap = stubBitmap(3000, 4000);
    stubToBlob(["image/webp"]);

    await downscaleNotePhoto(
      new File(["photo"], "porch.jpg", { type: "image/jpeg" }),
      OPTIONS
    );

    expect(canvases[0]?.width).toBe(1536);
    expect(canvases[0]?.height).toBe(2048);
    expect(drawImage).toHaveBeenCalledWith(bitmap, 0, 0, 1536, 2048);
  });

  it("does not upscale images smaller than maxEdgePx", async () => {
    stubBitmap(800, 600);
    stubToBlob(["image/webp"]);

    await downscaleNotePhoto(
      new File(["photo"], "porch.jpg", { type: "image/jpeg" }),
      OPTIONS
    );

    expect(canvases[0]?.width).toBe(800);
    expect(canvases[0]?.height).toBe(600);
  });

  it("encodes as WebP with the given quality and renames the file", async () => {
    stubBitmap(4000, 3000);
    const toBlob = stubToBlob(["image/webp"]);

    const result = await downscaleNotePhoto(
      new File(["photo"], "IMG_0001.HEIC.jpeg", { type: "image/jpeg" }),
      OPTIONS
    );

    expect(toBlob).toHaveBeenCalledTimes(1);
    expect(toBlob).toHaveBeenCalledWith(expect.any(Function), "image/webp", 0.82);
    expect(result).toBeInstanceOf(File);
    expect(result.type).toBe("image/webp");
    expect(result.name).toBe("IMG_0001.HEIC.webp");
  });

  it("falls back to JPEG when the browser returns PNG instead of WebP (Safari)", async () => {
    stubBitmap(4000, 3000);
    const toBlob = stubToBlob(["image/png", "image/jpeg"]);

    const result = await downscaleNotePhoto(
      new File(["photo"], "porch.png", { type: "image/png" }),
      OPTIONS
    );

    expect(toBlob).toHaveBeenNthCalledWith(2, expect.any(Function), "image/jpeg", 0.82);
    expect(result.type).toBe("image/jpeg");
    expect(result.name).toBe("porch.jpg");
  });

  it("paints a white background before drawing so transparent images don't turn black as JPEG", async () => {
    const bitmap = stubBitmap(800, 600);
    stubToBlob(["image/png", "image/jpeg"]);

    await downscaleNotePhoto(
      new File(["photo"], "logo.png", { type: "image/png" }),
      OPTIONS
    );

    expect(context.fillStyle).toBe("#ffffff");
    expect(fillRect).toHaveBeenCalledWith(0, 0, 800, 600);
    expect(fillRect.mock.invocationCallOrder[0]).toBeLessThan(
      drawImage.mock.invocationCallOrder[0] ?? 0
    );
    expect(drawImage).toHaveBeenCalledWith(bitmap, 0, 0, 800, 600);
  });

  it("falls back to JPEG when WebP encoding returns nothing", async () => {
    stubBitmap(4000, 3000);
    stubToBlob([null, "image/jpeg"]);

    const result = await downscaleNotePhoto(
      new File(["photo"], "porch.jpg", { type: "image/jpeg" }),
      OPTIONS
    );

    expect(result.type).toBe("image/jpeg");
  });

  describe("retry when the result is over maxBytes", () => {
    const RETRY_OPTIONS = { ...OPTIONS, maxBytes: 1000, retryQuality: 0.7 };

    it("does not retry when the first result fits", async () => {
      stubBitmap(4000, 3000);
      const toBlob = stubToBlob([{ type: "image/webp", size: 1000 }]);

      const result = await downscaleNotePhoto(
        new File(["photo"], "porch.jpg", { type: "image/jpeg" }),
        RETRY_OPTIONS
      );

      expect(toBlob).toHaveBeenCalledTimes(1);
      expect(result.size).toBe(1000);
    });

    it("re-encodes once at retryQuality and returns the smaller result", async () => {
      stubBitmap(4000, 3000);
      const toBlob = stubToBlob([
        { type: "image/webp", size: 1001 },
        { type: "image/webp", size: 800 },
      ]);

      const result = await downscaleNotePhoto(
        new File(["photo"], "porch.jpg", { type: "image/jpeg" }),
        RETRY_OPTIONS
      );

      expect(toBlob).toHaveBeenCalledTimes(2);
      expect(toBlob).toHaveBeenNthCalledWith(2, expect.any(Function), "image/webp", 0.7);
      expect(result.type).toBe("image/webp");
      expect(result.size).toBe(800);
    });

    it("retries straight in JPEG when WebP is unsupported (Safari)", async () => {
      stubBitmap(4000, 3000);
      const toBlob = stubToBlob([
        "image/png",
        { type: "image/jpeg", size: 1500 },
        { type: "image/jpeg", size: 900 },
      ]);

      const result = await downscaleNotePhoto(
        new File(["photo"], "IMG_0001.jpg", { type: "image/jpeg" }),
        RETRY_OPTIONS
      );

      expect(toBlob).toHaveBeenCalledTimes(3);
      expect(toBlob).toHaveBeenNthCalledWith(3, expect.any(Function), "image/jpeg", 0.7);
      expect(result.type).toBe("image/jpeg");
      expect(result.size).toBe(900);
    });

    it("returns the retry result even if it is still too large, leaving the decision to validation", async () => {
      stubBitmap(4000, 3000);
      stubToBlob([
        { type: "image/webp", size: 2000 },
        { type: "image/webp", size: 1500 },
      ]);

      const result = await downscaleNotePhoto(
        new File(["photo"], "porch.jpg", { type: "image/jpeg" }),
        RETRY_OPTIONS
      );

      expect(result.size).toBe(1500);
    });
  });

  it("rejects when neither WebP nor JPEG can be produced, never returning PNG", async () => {
    stubBitmap(4000, 3000);
    stubToBlob(["image/png", "image/png"]);

    await expect(
      downscaleNotePhoto(new File(["photo"], "porch.jpg", { type: "image/jpeg" }), OPTIONS)
    ).rejects.toThrow();
  });

  it("rejects when the image cannot be decoded", async () => {
    vi.stubGlobal("createImageBitmap", vi.fn().mockRejectedValue(new Error("decode")));

    await expect(
      downscaleNotePhoto(new File(["photo"], "porch.jpg", { type: "image/jpeg" }), OPTIONS)
    ).rejects.toThrow();
  });

  it("releases the decoded bitmap", async () => {
    const bitmap = stubBitmap(4000, 3000);
    stubToBlob(["image/webp"]);

    await downscaleNotePhoto(
      new File(["photo"], "porch.jpg", { type: "image/jpeg" }),
      OPTIONS
    );

    expect(bitmap.close).toHaveBeenCalledTimes(1);
  });
});
