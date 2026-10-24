const IMAGEKIT_HOST = /(^|\.)imagekit\.io$/i;

export const IMAGE_SIZES =
  "(min-width: 1500px) 20vw, (min-width: 1000px) 25vw, (min-width: 600px) 33vw, (min-width: 400px) 50vw, 100vw";

export function isImageKitUrl(src: string) {
  try {
    return IMAGEKIT_HOST.test(new URL(src).hostname);
  } catch {
    return false;
  }
}

export function imageKitUrl(src: string, width: number, quality = 80) {
  if (!src || !isImageKitUrl(src) || /[?&]tr=/.test(src)) {
    return src;
  }

  const separator = src.includes("?") ? "&" : "?";
  return `${src}${separator}tr=w-${width},q-${quality},f-auto`;
}

export function imageKitSrcSet(
  src: string,
  widths: number[] = [320, 480, 640, 960, 1280, 1600]
) {
  if (!isImageKitUrl(src)) {
    return undefined;
  }

  return widths
    .map((width) => `${imageKitUrl(src, width)} ${width}w`)
    .join(", ");
}
