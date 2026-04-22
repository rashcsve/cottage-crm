import { describe, expect, it } from "vitest";
import {
  NOTE_PHOTO_MAX_SIZE_BYTES,
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
});
