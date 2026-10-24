import { isUsernameAvailable } from "~~/server/utils/actions/username";
import { getLoggedInUser } from "~~/server/utils/actions/user/query";

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
    const loggedInUser = await getLoggedInUser(session.id);
    const isAvailable = await isUsernameAvailable(username, loggedInUser?.id);
    return { isAvailable };
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
      message: (error as Error).message,
    });
  }
});
