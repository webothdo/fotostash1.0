import { getPhotoBySlugWithUser } from "~~/server/utils/actions/photo/query";

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug");

  if (!slug) {
    throw createError({
      statusCode: 401,
      message: "Please provide a valid value",
    });
  }

  try {
    const singlePhoto = await getPhotoBySlugWithUser(slug);
    if (!singlePhoto) {
      throw createError({
        statusCode: 404,
        message: "Photo not found",
      });
    }
    return singlePhoto;
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
      message: (error as Error).message,
    });
  }
});
