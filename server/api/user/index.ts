import { getUserWithPhotos } from "~~/server/utils/actions/user/query";

export default defineEventHandler(async (event) => {
  try {
    const session = await event.context.kinde.getUserProfile();
    if (!session) {
      throw createError({
        statusCode: 401,
        statusMessage: "Unauthorized",
      });
    }

    const data = await getUserWithPhotos(session.id);
    return data;
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
      message: (error as Error).message,
    });
  }
});
