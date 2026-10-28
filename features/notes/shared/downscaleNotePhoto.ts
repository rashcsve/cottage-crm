const WEBP_TYPE = "image/webp";
const JPEG_TYPE = "image/jpeg";

export interface DownscaleNotePhotoOptions {
  maxEdgePx: number;
  quality: number;
  maxBytes?: number;
  retryQuality?: number;
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob(resolve, type, quality);
  });
}

async function encodeCanvas(
  canvas: HTMLCanvasElement,
  quality: number,
  skipWebp: boolean
): Promise<Blob> {
  if (!skipWebp) {
    const webp = await canvasToBlob(canvas, WEBP_TYPE, quality);
    if (webp?.type === WEBP_TYPE) {
      return webp;
    }
  }

  const jpeg = await canvasToBlob(canvas, JPEG_TYPE, quality);
  if (jpeg?.type === JPEG_TYPE) {
    return jpeg;
  }

  throw new Error("Could not encode note photo as WebP or JPEG");
}

function renameForType(fileName: string, type: string): string {
  const extension = type === WEBP_TYPE ? "webp" : "jpg";
  const dotIndex = fileName.lastIndexOf(".");
  const baseName = dotIndex > 0 ? fileName.slice(0, dotIndex) : fileName;

  return `${baseName}.${extension}`;
}

export async function downscaleNotePhoto(
  file: File,
  { maxEdgePx, quality, maxBytes, retryQuality }: DownscaleNotePhotoOptions
): Promise<File> {
  const bitmap = await createImageBitmap(file, {
    imageOrientation: "from-image",
  });

  try {
    const scale = Math.min(1, maxEdgePx / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Canvas 2D context is not available");
    }
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, width, height);
    context.drawImage(bitmap, 0, 0, width, height);

    let blob = await encodeCanvas(canvas, quality, false);

    if (
      maxBytes !== undefined &&
      retryQuality !== undefined &&
      blob.size > maxBytes
    ) {
      blob = await encodeCanvas(canvas, retryQuality, blob.type === JPEG_TYPE);
    }

    return new File([blob], renameForType(file.name, blob.type), {
      type: blob.type,
      lastModified: file.lastModified,
    });
  } finally {
    bitmap.close();
  }
}
