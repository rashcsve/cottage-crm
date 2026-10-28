import { describe, expect, it } from "vitest";
import {
  HOSTING_REQUEST_BODY_LIMIT_BYTES,
  isHeicNotePhotoFile,
  isValidNotePhotoThumbnailFile,
  NOTE_FORM_OVERHEAD_BYTES,
  NOTE_PHOTO_INPUT_ACCEPT,
  NOTE_PHOTO_MAX_COUNT,
  NOTE_PHOTO_MAX_SIZE_BYTES,
  NOTE_PHOTO_THUMBNAIL_MAX_SIZE_BYTES,
  SERVER_ACTION_BODY_SIZE_LIMIT_BYTES,
  validateNotePhotoFiles,
} from "@/features/notes/shared/notePhotoValidation";

const messages = {
  tooMany: "too-many",
  invalidType: "invalid-type",
  tooLarge: "too-large",
};

describe("features/notes/shared/notePhotoValidation", () => {
  it("rejects too many files", () => {
    const files = Array.from({ length: 5 }, (_, index) =>
      new File([`${index}`], `${index}.jpg`, {
        type: "image/jpeg",
      })
    );

    expect(validateNotePhotoFiles(files, messages)).toBe("too-many");
  });

  it("rejects unsupported file types", () => {
    const files = [
      new File(["gif"], "animated.gif", {
        type: "image/gif",
      }),
    ];

    expect(validateNotePhotoFiles(files, messages)).toBe("invalid-type");
  });

  it("rejects files that are too large", () => {
    const files = [
      new File([new Uint8Array(NOTE_PHOTO_MAX_SIZE_BYTES + 1)], "large.jpg", {
        type: "image/jpeg",
      }),
    ];

    expect(validateNotePhotoFiles(files, messages)).toBe("too-large");
  });

  it("accepts files at exactly the size limit", () => {
    const files = [
      new File([new Uint8Array(NOTE_PHOTO_MAX_SIZE_BYTES)], "max.jpg", {
        type: "image/jpeg",
      }),
    ];

    expect(validateNotePhotoFiles(files, messages)).toBeNull();
  });

  describe("HEIC", () => {
    it("lets the file input pick HEIC/HEIF by type and extension", () => {
      const accepted = NOTE_PHOTO_INPUT_ACCEPT.split(",");

      expect(accepted).toEqual(
        expect.arrayContaining([
          "image/jpeg",
          "image/png",
          "image/webp",
          "image/heic",
          "image/heif",
          ".heic",
          ".heif",
        ])
      );
    });

    it.each([
      ["image/heic", "IMG_0001.HEIC"],
      ["image/heif", "IMG_0001.heif"],
      ["", "IMG_0001.HEIC"],
      ["", "IMG_0001.heif"],
      ["application/octet-stream", "IMG_0001.heic"],
    ])("recognises type %j named %s as HEIC", (type, name) => {
      expect(isHeicNotePhotoFile(new File(["heic"], name, { type }))).toBe(true);
    });

    it.each([
      ["image/jpeg", "IMG_0001.jpg"],
      ["image/gif", "porch.gif"],
      ["", "notes.txt"],
      ["image/jpeg", "heic-tips.jpg"],
    ])("does not treat type %j named %s as HEIC", (type, name) => {
      expect(isHeicNotePhotoFile(new File(["x"], name, { type }))).toBe(false);
    });

    it("never accepts HEIC for upload, so it is never stored", () => {
      const files = [new File(["heic"], "IMG_0001.HEIC", { type: "image/heic" })];

      expect(validateNotePhotoFiles(files, messages)).toBe("invalid-type");
    });
  });

  describe("thumbnails", () => {
    it.each([
      ["image/webp", "porch.webp"],
      ["image/jpeg", "porch.jpg"],
    ])("accepts a %s thumbnail within the size limit", (type, name) => {
      const file = new File([new Uint8Array(NOTE_PHOTO_THUMBNAIL_MAX_SIZE_BYTES)], name, {
        type,
      });

      expect(isValidNotePhotoThumbnailFile(file)).toBe(true);
    });

    it.each([
      ["image/png", "porch.png"],
      ["image/gif", "porch.gif"],
      ["", "porch"],
    ])("rejects a %j thumbnail", (type, name) => {
      expect(isValidNotePhotoThumbnailFile(new File(["x"], name, { type }))).toBe(false);
    });

    it("rejects an empty thumbnail", () => {
      expect(
        isValidNotePhotoThumbnailFile(new File([], "porch.webp", { type: "image/webp" }))
      ).toBe(false);
    });

    it("rejects a thumbnail over the size limit", () => {
      const file = new File(
        [new Uint8Array(NOTE_PHOTO_THUMBNAIL_MAX_SIZE_BYTES + 1)],
        "porch.webp",
        { type: "image/webp" }
      );

      expect(isValidNotePhotoThumbnailFile(file)).toBe(false);
    });
  });

  describe("upload limits", () => {
    it("caps each photo at 1 MB", () => {
      expect(NOTE_PHOTO_MAX_SIZE_BYTES).toBe(1024 * 1024);
    });

    it("fits a full note (max photos + form overhead) into the server action body limit", () => {
      expect(
        NOTE_PHOTO_MAX_COUNT * NOTE_PHOTO_MAX_SIZE_BYTES + NOTE_FORM_OVERHEAD_BYTES
      ).toBeLessThanOrEqual(SERVER_ACTION_BODY_SIZE_LIMIT_BYTES);
    });

    it("leaves room in the overhead for the longest note content", () => {
      const maxContentUtf8Bytes = 5000 * 3;

      expect(NOTE_FORM_OVERHEAD_BYTES).toBeGreaterThan(maxContentUtf8Bytes);
    });

    it("leaves room in the overhead for max thumbnails plus the longest note content", () => {
      const maxContentUtf8Bytes = 5000 * 3;

      expect(
        NOTE_PHOTO_MAX_COUNT * NOTE_PHOTO_THUMBNAIL_MAX_SIZE_BYTES + maxContentUtf8Bytes
      ).toBeLessThan(NOTE_FORM_OVERHEAD_BYTES);
    });

    it("keeps the server action body limit within the hosting request limit", () => {
      expect(HOSTING_REQUEST_BODY_LIMIT_BYTES).toBe(4_500_000);
      expect(SERVER_ACTION_BODY_SIZE_LIMIT_BYTES).toBeLessThanOrEqual(
        HOSTING_REQUEST_BODY_LIMIT_BYTES
      );
    });
  });
});
