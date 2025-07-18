import { getAllPhotos } from "~~/server/utils/actions/photo/query";

export default defineEventHandler(async () => {
  try {
    const photos = await getAllPhotos();
    return photos;
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
      message: (error as Error).message,
    });
  }
});
