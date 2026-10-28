import { describe, expect, it } from "vitest";
import {
  HOSTING_REQUEST_BODY_LIMIT_BYTES,
  NOTE_FORM_OVERHEAD_BYTES,
  NOTE_PHOTO_MAX_COUNT,
  NOTE_PHOTO_MAX_SIZE_BYTES,
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

    it("keeps the server action body limit within the hosting request limit", () => {
      expect(HOSTING_REQUEST_BODY_LIMIT_BYTES).toBe(4_500_000);
      expect(SERVER_ACTION_BODY_SIZE_LIMIT_BYTES).toBeLessThanOrEqual(
        HOSTING_REQUEST_BODY_LIMIT_BYTES
      );
    });
  });
});
