import { nanoid } from "nanoid";
import { createUser } from "~~/server/utils/actions/user/insert";
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
    if (!data) {
      const newUser = createUser({
        userId: session.id,
        username: session.given_name
          ? session.given_name + nanoid(6)
          : session.family_name + nanoid(6),
      });
      return await getUserWithPhotos(session.id);
    }
    return data;
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
      message: (error as Error).message,
    });
  }
});
