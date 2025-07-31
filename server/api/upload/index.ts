import imagekitServer from "~~/server/utils/imagekit";
import { nanoid } from "nanoid";
import { z } from "zod";

const uploadSchema = z.object({
  name: z.string(),
  image: z.any(),
});

// Supported image MIME types
const SUPPORTED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
];

// MIME type to extension mapping
const MIME_TO_EXTENSION: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/webp": "webp",
  "image/svg+xml": "svg",
};

// Maximum file size (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

export default defineEventHandler(async (event) => {
  const formData = await readMultipartFormData(event);
  const session = await event.context.kinde.getUserProfile();
  if (!session) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
      message: "Please login to upload a photo",
    });
  }

  if (!formData || formData.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "No form data provided",
      message: "Please provide a valid form data",
    });
  }

  // Find the image file in the form data
  const fileEntry = formData.find(
    (entry) =>
      entry &&
      entry.type &&
      SUPPORTED_MIME_TYPES.includes(entry.type) &&
      entry.data
  );

  const nameEntry = formData
    .find((entry) => entry.name === "name")
    ?.data.toString();

  if (!nameEntry) {
    throw createError({
      statusCode: 400,
      statusMessage: "No name provided",
      message: "Please provide a valid name",
    });
  }

  if (!fileEntry) {
    throw createError({
      statusCode: 400,
      statusMessage: "No valid image file found",
      message: "Supported formats: JPEG, PNG, GIF, WebP, and SVG",
    });
  }

  // Check file size
  if (fileEntry.data.length > MAX_FILE_SIZE) {
    throw createError({
      statusCode: 400,
      statusMessage: "File too large",
      message: `Maximum file size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
    });
  }

  const slug =
    nameEntry
      .toLowerCase()
      .replace(/\s+/g, "-") // Replace spaces with -
      .replace(/[^\w\-]+/g, "") // Remove all non-word chars
      .replace(/\-\-+/g, "-") // Replace multiple - with single -
      .replace(/^-+/, "") // Trim - from start of text
      .replace(/-+$/, "") +
    "-" +
    nanoid(8);
  try {
    const uploadedPhoto = await imagekitServer().upload({
      file: fileEntry.data,
      fileName: nameEntry,
      folder: "uploads",
    });

    const data = await getLoggedInUser(session.id);

    const photo = await createPhoto({
      userId: data?.id!,
      url: uploadedPhoto.url,
      title: nameEntry,
      slug: slug,
      height: uploadedPhoto.height,
      width: uploadedPhoto.width,
    });
    return photo;
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
      message: (error as Error).message,
    });
  }
});
