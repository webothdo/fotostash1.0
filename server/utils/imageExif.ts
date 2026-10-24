import exifr from "exifr";
import type { PhotoExif } from "~~/server/db/schema";

const round = (value: number, digits = 2) =>
  Math.round(value * 10 ** digits) / 10 ** digits;

const positiveNumber = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value) && value > 0
    ? round(value)
    : undefined;

export async function getImageExif(
  input: Buffer | Uint8Array
): Promise<PhotoExif | null> {
  try {
    const data = await exifr.parse(input, {
      tiff: true,
      exif: true,
      gps: false,
      pick: [
        "Make",
        "Model",
        "LensModel",
        "ISO",
        "FNumber",
        "ExposureTime",
        "FocalLength",
        "DateTimeOriginal",
      ],
    });

    if (!data) return null;

    const make = String(data.Make ?? "").trim();
    const model = String(data.Model ?? "").trim();
    const camera =
      model && make && !model.toLowerCase().includes(make.toLowerCase())
        ? `${make} ${model}`
        : model || make;

    const exif: PhotoExif = {
      camera: camera || undefined,
      lens: String(data.LensModel ?? "").trim() || undefined,
      iso: positiveNumber(data.ISO),
      aperture: positiveNumber(data.FNumber),
      shutterSpeed: positiveNumber(data.ExposureTime),
      focalLength: positiveNumber(data.FocalLength),
      takenAt:
        data.DateTimeOriginal instanceof Date &&
        !Number.isNaN(data.DateTimeOriginal.getTime())
          ? data.DateTimeOriginal.toISOString()
          : undefined,
    };

    return Object.values(exif).some((value) => value !== undefined)
      ? exif
      : null;
  } catch {
    return null;
  }
}
