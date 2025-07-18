import imagekitServer from "~~/server/utils/imagekit";
import { nanoid } from "nanoid";
import { z } from "zod";

const uploadSchema = z.object({
  name: z.string(),
  image: z.string(),
  userId: z.string(),
});

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, uploadSchema.safeParse);
  if (!body.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: body.error.message,
    });
  }
  try {
    const uploadedPhoto = await imagekitServer().upload({
      file: body.data.image,
      fileName: body.data.name,
      folder: "uploads",
    });

    const photo = await createPhoto({
      userId: body.data.userId,
      url: uploadedPhoto.url,
      title: body.data.name + nanoid(),
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
