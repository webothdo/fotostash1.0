import { isUsernameAvailable } from "~~/server/utils/actions/username";

export default defineEventHandler(async (event) => {
  const username = getQuery(event).username as string;
  const session = await event.context.kinde.getUserProfile();
  if (!session) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    });
  }

  if (!username) {
    throw createError({
      statusCode: 400,
      message: "Username is required",
    });
  }

  try {
    const isAvailable = await isUsernameAvailable(username);
    return { isAvailable };
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
      message: (error as Error).message,
    });
  }
});
