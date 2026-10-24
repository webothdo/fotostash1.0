import sharp from "sharp";

export interface ImageDimensions {
  width: number;
  height: number;
}

/**
 * Read the display dimensions of an image. Images with EXIF orientations
 * 5-8 are rotated by browsers, so their width and height are swapped here.
 */
export async function getImageDimensions(
  input: Buffer | Uint8Array
): Promise<ImageDimensions | null> {
  try {
    const metadata = await sharp(input).metadata();

    if (!metadata.width || !metadata.height) {
      return null;
    }

    const isRotated = (metadata.orientation ?? 1) >= 5;

    return isRotated
      ? { width: metadata.height, height: metadata.width }
      : { width: metadata.width, height: metadata.height };
  } catch {
    return null;
  }
}

export async function getImageDimensionsFromUrl(
  url: string
): Promise<ImageDimensions | null> {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(30_000),
  });

  if (!response.ok) {
    throw new Error(`Failed to download image (${response.status})`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  return getImageDimensions(buffer);
}
