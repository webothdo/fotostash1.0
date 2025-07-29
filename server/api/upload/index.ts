import imagekitServer from "~~/server/utils/imagekit";
import { nanoid } from "nanoid";
import { z } from "zod";

const uploadSchema = z.object({
  name: z.string(),
  image: z.any(),
});

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, uploadSchema.safeParse);
  const session = await event.context.kinde.getUserProfile();
  if (!session) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    });
  }

  if (!body.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: body.error.message,
    });
  }

  if (!body.data?.image) {
    throw createError({
      statusCode: 400,
      statusMessage: "No file provided",
    });
  }

  const slug =
    body.data.name
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
      file: body.data.image,
      fileName: body.data.name,
      folder: "uploads",
    });

    const data = await getLoggedInUser(session.id);

    const photo = await createPhoto({
      userId: data?.id!,
      url: uploadedPhoto.url,
      title: body.data.name,
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
